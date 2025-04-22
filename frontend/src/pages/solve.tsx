import { useAuth } from "@/context/auth-context";
import type { SelectedAnswers, TestSolve } from "@shared/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import AnswersContainer from "@/components/answer-container";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { File, User } from "lucide-react";

export default function Solve() {
  const { user } = useAuth()!;
  const navigate = useNavigate();
  const { id } = useParams();

  const [test, setTest] = useState<TestSolve | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [length, setLength] = useState(0);

  const [submitOpen, setSubmitOpen] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  useEffect(() => {
    const answeredLength = Object.keys(selectedAnswers).length;
    setLength(answeredLength);
    if (answeredLength === test?.questions?.length) setDisableSubmit(false);
  }, [selectedAnswers]);

  const handleSubmit = async () => {
    const response = await fetch(`http://localhost:1337/api/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ testId: test?.id, answers: selectedAnswers }),
    });

    if (!response.ok) {
      toast.error("Something happened");
      return;
    }

    navigate(-1);
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchTest = async () => {
      try {
        const response = await fetch(
          `http://localhost:1337/api/tests/${id}/solve`,
          {
            credentials: "include",
          },
        );

        if (response.status === 307) {
          navigate("/");
          return;
        }

        if (!response.ok) throw new Error("Could not fetch test");

        const testData = (await response.json()).data;
        setTest(testData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTest();
  }, [id, user, navigate]);

  return (
    <>
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="h-full flex flex-col justify-between items-start gap-2">
          <h1 className="font-bold text-xl">{test?.title}</h1>
          <h2 className="flex gap-1 text-muted-foreground">
            <User size={20} /> {test?.author?.username},
            <File size={20} /> {test?.category?.name}
          </h2>
          <ScrollArea className="w-[80svw] h-full">
            {(test?.questions.length ?? 0) ? (
              <Accordion type="multiple">
                {test?.questions.map((q) => (
                  <AnswersContainer
                    key={q.id}
                    question={q}
                    selectedAnswer={selectedAnswers[q.id] || null}
                    onAnswerSelect={handleAnswerSelect}
                  />
                ))}
              </Accordion>
            ) : (
              <p className="text-xl">No questions found :(</p>
            )}
          </ScrollArea>
        </div>

        <Button
          disabled={disableSubmit}
          size={"lg"}
          className="w-full sm:text-lg py-6"
          onClick={() => setSubmitOpen(true)}
        >
          {disableSubmit ? `${length} of ${test?.questions.length}` : "Submit"}
        </Button>
      </div>

      <AlertDialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              You are about to submit your test?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Results will be permanently saved
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
