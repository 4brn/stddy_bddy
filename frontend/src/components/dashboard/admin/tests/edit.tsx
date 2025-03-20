import { TestSchema, type Question, type Test } from "@schema";

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

export default function Edit({
  open,
  onOpenChange,
  crud,
  test,
}: {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  crud: Crud;
  test: Test;
}) {
  const created = new Date(test.createdAt).toLocaleDateString();
  const updated = new Date(test.updatedAt).toLocaleDateString();
  const [updatedTest, setUpdatedTest] = useState(test);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleSave = async () => {
    const formattedTest = {
      ...updatedTest,
      createdAt: new Date(updatedTest.createdAt),
      updatedAt: new Date(Date.now()),
    };

    const { success, data } = TestSchema.safeParse(formattedTest);
    if (!success) {
      toast.error("Validation error");
      return;
    }

    const response = await fetch(`http://localhost:1337/api/tests/${test.id}`, {
      credentials: "include",
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      toast.error("Something happened");
      console.log(response);
      return;
    }

    crud.update(formattedTest);
    toast.success(`Updated test ${formattedTest.id}`);
    setAlertOpen(false);
    onOpenChange(false);
  };

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUpdatedTest((prev) => ({ ...prev, title: e.target.value }));
    },
    [],
  );

  const reset = () => {
    setUpdatedTest(test);
    toast.info("Reset test");
  };

  const togglePrivate = useCallback(() => {
    setUpdatedTest((prev) => ({ ...prev, isPrivate: !prev.isPrivate }));
    toast.info("Toggled privacy");
  }, []);

  const addQuestion = useCallback(() => {
    setUpdatedTest((prev) => ({
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
      setUpdatedTest((prev) => ({
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
      setUpdatedTest((prev) => ({
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
    setUpdatedTest((prev) => ({
      ...prev,
      content: prev.content.filter((q) => q.id !== questionId),
    }));
    toast.info("Deleted Question");
  }, []);

  const setCorrectAnswer = useCallback(
    (questionId: string | number, answerId: number) => {
      setUpdatedTest((prev) => ({
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
              value={updatedTest.title}
              placeholder="Title"
              onChange={handleTitleChange}
            />

            <Button
              onClick={togglePrivate}
              variant={updatedTest.isPrivate ? "destructive" : "secondary"}
              className="text-sm"
            >
              {updatedTest.isPrivate ? "Private" : "Public"}
            </Button>

            <Button variant="outline" onClick={reset}>
              <RefreshCw />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-start grid grid-cols-1 sm:grid-cols-2 mt-2">
            <span>Id: {test.id}</span>
            <span>Created: {created}</span>
            <span>Author: {test.ownerId}</span>
            <span>Updated: {updated}</span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          {updatedTest.content.map((question) => (
            <Card key={question.id} className="mb-2">
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Input
                    id={`question-${question.id}`}
                    onChange={(e) =>
                      updateQuestion(question.id, e.target.value)
                    }
                    value={question.question}
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
            <Plus />
          </Button>
        </ScrollArea>

        <DialogFooter>
          <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button>Save</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will change the test.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
