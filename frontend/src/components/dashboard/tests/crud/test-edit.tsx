import type {
  Question,
  TestSelect as Test,
  TestCrud as Crud,
} from "@shared/types";

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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState, useCallback, useEffect, ChangeEvent } from "react";
import { Ellipsis, Plus, RefreshCw, Save, Star, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TestEdit({
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
  const [updatedTest, setUpdatedTest] = useState<Test>(test);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    setUpdatedTest(test);
  }, [test]);

  const created = new Date(test.created_at).toLocaleDateString();
  const updated = new Date(test.updated_at).toLocaleDateString();

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:1337/api/tests/${test.id}`,
        {
          credentials: "include",
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTest),
        },
      );

      if (!response.ok) {
        console.error("Update failed");
        return;
      }

      const updatedData = await response.json();
      crud.update({ ...updatedTest, ...updatedData });
      toast.success(`Updated test (${updatedTest.id})`);
      setAlertOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Something happened");
    }
  };

  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUpdatedTest((prev) => ({ ...prev, title: e.target.value }));
  }, []);

  const reset = () => {
    setUpdatedTest(test);
    toast.info("Reset");
  };

  const handlePrivateToggle = useCallback(() => {
    setUpdatedTest((prev) => ({ ...prev, is_private: !prev.is_private }));
  }, []);

  const handleQuestionAdd = useCallback(() => {
    const maxId = updatedTest.questions.reduce(
      (max, q) => (typeof q.id === "number" && q.id > max ? q.id : max),
      0,
    );

    const newQuestion: Question = {
      id: maxId + 1,
      text: "",
      answers: [],
      correctId: null,
    };

    setUpdatedTest((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    toast.info(`Added question`);
  }, [updatedTest.questions]);

  const handleQuestionUpdate = useCallback(
    (questionId: number, text: string) => {
      setUpdatedTest((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, text } : q,
        ),
      }));
    },
    [],
  );

  const handleAnswerAdd = useCallback((questionId: number) => {
    setUpdatedTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id === questionId) {
          const maxAnswerId = q.answers.reduce(
            (max, a) => (a.id > max ? a.id : max),
            0,
          );

          return {
            ...q,
            answers: [...q.answers, { id: maxAnswerId + 1, value: "" }],
          };
        }
        return q;
      }),
    }));
  }, []);

  const handleAnswerUpdate = useCallback(
    (questionId: number | string, answerId: number, text: string) => {
      setUpdatedTest((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                answers: q.answers.map((a) =>
                  a.id === answerId ? { ...a, value: text } : a,
                ),
              }
            : q,
        ),
      }));
    },
    [],
  );

  const handleAnswerDelete = useCallback(
    (questionId: number, answerId: number) => {
      setUpdatedTest((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id === questionId) {
            const isCorrectAnswerDeleted = q.correctId === answerId;
            return {
              ...q,
              answers: q.answers.filter((a) => a.id !== answerId),
              correctId: isCorrectAnswerDeleted ? null : q.correctId,
            };
          }
          return q;
        }),
      }));
    },
    [],
  );

  const handleQuestionDelete = useCallback((questionId: string | number) => {
    setUpdatedTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  }, []);

  const handleAnswerSetCorrect = useCallback(
    (questionId: string | number, answerId: number) => {
      setUpdatedTest((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, correctId: answerId } : q,
        ),
      }));
    },
    [],
  );

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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
              onClick={handlePrivateToggle}
              variant={updatedTest.is_private ? "destructive" : "secondary"}
              className="text-sm"
            >
              {updatedTest.is_private ? "Private" : "Public"}
            </Button>

            <Button variant="outline" onClick={reset}>
              <RefreshCw />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-start grid grid-cols-1 sm:grid-cols-2 mt-2">
            <span>Id: {test.id}</span>
            <span>Created: {created}</span>
            <span>Author: {test.author_id}</span>
            <span>Updated: {updated}</span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <Accordion type="multiple">
            {updatedTest.questions.map((question, i) => (
              <AccordionItem key={i} value={`${question.id}`}>
                <AccordionTrigger className="cursor-pointer hover:no-underline flex items-center gap-2 ">
                  <Label htmlFor={`question-${question.id}`}>{i + 1}) </Label>
                  <Input
                    id={`question-${question.id}`}
                    onClick={stopPropagation}
                    onChange={(e) =>
                      handleQuestionUpdate(question.id, e.target.value)
                    }
                    value={question.text}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      stopPropagation(e);
                      handleQuestionDelete(question.id);
                    }}
                    size={"icon"}
                  >
                    <Trash color="red" />
                  </Button>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2 mr-6">
                  {question.answers.map((answer, i) => (
                    <div key={answer.id} className="flex gap-2">
                      <Label
                        htmlFor={`answer-${question.id}-${answer.id}`}
                        className={
                          answer.id === question.correctId
                            ? "text-yellow-500 font-bold"
                            : ""
                        }
                      >{`${i + 1}) `}</Label>
                      <Input
                        id={`answer-${question.id}-${answer.id}`}
                        onChange={(e) =>
                          handleAnswerUpdate(
                            question.id,
                            answer.id,
                            e.target.value,
                          )
                        }
                        value={answer.value}
                        className={
                          answer.id === question.correctId
                            ? "border-yellow-500"
                            : ""
                        }
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size={"icon"} variant={"outline"}>
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={answer.id === question.correctId}
                            onClick={() =>
                              handleAnswerSetCorrect(question.id, answer.id)
                            }
                          >
                            <Star
                              color={
                                answer.id === question.correctId
                                  ? "gold"
                                  : "grey"
                              }
                            />
                            Mark
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              handleAnswerDelete(question.id, answer.id)
                            }
                          >
                            <Trash color="red" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                  <div
                    className="flex gap-2 items-center"
                    hidden={question.answers.length >= 4}
                  >
                    <Label htmlFor={`add-answer-${question.id}`}>?) </Label>
                    <Button
                      id={`add-answer-${question.id}`}
                      className="flex-1"
                      variant={"secondary"}
                      onClick={() => handleAnswerAdd(question.id)}
                    >
                      <Plus /> Add Answer
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Button
            className="w-full mt-4"
            variant="outline"
            onClick={handleQuestionAdd}
          >
            <Plus className="mr-2" /> Add Question
          </Button>
        </ScrollArea>
        <DialogFooter>
          <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant={"secondary"}>
                <Save strokeWidth={2} />
                Save test
              </Button>
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
