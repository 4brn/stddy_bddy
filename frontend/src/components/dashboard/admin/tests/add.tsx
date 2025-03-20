import { TestSchema, type Test } from "@schema";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useCallback } from "react";
import { Plus, RefreshCw, Star, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Crud } from "./tests";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddTest({
  open,
  user,
  onOpenChange,
  crud,
}: {
  open: boolean;
  user: User;
  onOpenChange: (state: boolean) => void;
  crud: Crud;
}) {
  const [newTest, setNewTest] = useState<
    Omit<Test, "id" | "createdAt" | "updatedAt">
  >({
    title: "New Test",
    content: [],
    ownerId: null, // This will be set by the backend
    isPrivate: false,
  });
  const [alertOpen, setAlertOpen] = useState(false);

  const handleSave = async () => {
    const formattedTest = {
      ...newTest,
      // Dates will be handled by the backend
    };

    const { success } = TestSchema.safeParse(formattedTest);
    if (!success) {
      toast.error("Validation error");
      return;
    }

    const response = await fetch("http://localhost:1337/api/tests", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedTest),
    });

    if (!response.ok) {
      toast.error("Something happened");
      console.log(response);
      return;
    }

    const createdTest = await response.json();
    crud.add(createdTest);
    toast.success(`Created test ${createdTest.id}`);
    setAlertOpen(false);
    onOpenChange(false);
    resetForm();
  };

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewTest((prev) => ({ ...prev, title: e.target.value }));
    },
    [],
  );

  const resetForm = () => {
    setNewTest({
      title: "New Test",
      content: [],
      ownerId: user.id,
      isPrivate: false,
    });
    toast.info("Reset test form");
  };

  const togglePrivate = useCallback(() => {
    setNewTest((prev) => ({ ...prev, isPrivate: !prev.isPrivate }));
    toast.info("Toggled privacy");
  }, []);

  const addQuestion = useCallback(() => {
    setNewTest((prev) => ({
      ...prev,
      content: [
        ...prev.content,
        {
          id: prev.content.length + 1,
          question: "",
          options: [
            { id: 1, value: "" },
            { id: 2, value: "" },
            { id: 3, value: "" },
            { id: 4, value: "" },
          ],
          correct: 9999,
        },
      ],
    }));
    toast.info(`Added question`);
  }, []);

  const updateQuestion = useCallback(
    (questionId: string | number, text: string) => {
      setNewTest((prev) => ({
        ...prev,
        content: prev.content.map((q) =>
          q.id === questionId ? { ...q, question: text } : q,
        ),
      }));
    },
    [],
  );

  const updateAnswer = useCallback(
    (questionId: string | number, answerId: string | number, text: string) => {
      setNewTest((prev) => ({
        ...prev,
        content: prev.content.map((q) => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            options: q.options.map((opt) =>
              opt.id === answerId ? { ...opt, value: text } : opt,
            ),
          };
        }),
      }));
    },
    [],
  );

  const handleDelete = useCallback((questionId: string | number) => {
    setNewTest((prev) => ({
      ...prev,
      content: prev.content.filter((q) => q.id !== questionId),
    }));
    toast.info("Deleted Question");
  }, []);

  const setCorrectAnswer = useCallback(
    (questionId: string | number, answerId: number) => {
      setNewTest((prev) => ({
        ...prev,
        content: prev.content.map((q) =>
          q.id === questionId ? { ...q, correct: answerId } : q,
        ),
      }));
    },
    [],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start flex gap-3 justify-between mr-3">
            <Input
              className="truncate overflow-hidden text-ellipsis whitespace-nowrap"
              id="title"
              value={newTest.title}
              placeholder="Title"
              onChange={handleTitleChange}
            />

            <Button
              onClick={togglePrivate}
              variant={newTest.isPrivate ? "destructive" : "secondary"}
              className="text-sm"
            >
              {newTest.isPrivate ? "Private" : "Public"}
            </Button>

            <Button variant="outline" onClick={resetForm}>
              <RefreshCw />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-start mt-2">
            Create a new test by adding questions and answers below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          {newTest.content.map((question) => (
            <Card key={question.id} className="mb-2">
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Input
                    id={`question-${question.id}`}
                    onChange={(e) =>
                      updateQuestion(question.id, e.target.value)
                    }
                    value={question.question}
                    placeholder="Enter question text"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(question.id)}
                  >
                    <Trash color="red" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {question.options.map((answer) => (
                  <div key={answer.id} className="flex gap-1">
                    <Label
                      htmlFor={`answer-${question.id}-${answer.id}`}
                    >{`${answer.id}) `}</Label>
                    <Input
                      id={`answer-${question.id}-${answer.id}`}
                      onChange={(e) =>
                        updateAnswer(question.id, answer.id, e.target.value)
                      }
                      value={answer.value}
                      placeholder="Enter answer text"
                    />
                    <Button
                      variant="outline"
                      disabled={answer.id === question.correct}
                      className={
                        answer.id === question.correct ? "bg-yellow-200" : ""
                      }
                      onClick={() => setCorrectAnswer(question.id, answer.id)}
                    >
                      <Star />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          <Button className="w-full" variant="outline" onClick={addQuestion}>
            <Plus /> Add Question
          </Button>
        </ScrollArea>

        <DialogFooter>
          <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button>Create Test</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Test Creation</AlertDialogTitle>
                <AlertDialogDescription>
                  This will create a new test. Are you sure you want to
                  continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave}>
                  Create
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
