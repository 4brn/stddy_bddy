import type {
  Question,
  TestCrud as Crud,
  Answer,
  UserSelect as User,
  CategorySelect as Category,
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
} from "@/components/ui/alert-dialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState, useCallback, ChangeEvent } from "react";
import { Ellipsis, Plus, RefreshCw, Save, Star, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export default function TestAdd({
  open,
  onOpenChange,
  crud,
  users,
  categories,
}: {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  crud: Crud;
  users: User[];
  categories: Category[];
}) {
  const { user } = useAuth()!;
  const [newTest, setNewTest] = useState({
    title: "",
    is_private: false,
    questions: [] as Question[],
  });
  const [alertOpen, setAlertOpen] = useState(false);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/tests`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTest),
      });

      if (!response.ok) {
        console.error("Creation failed");
        return;
      }

      crud.add();
      toast.success(`Created new test`);
      setAlertOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Something happened");
    }
  };

  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNewTest((prev) => ({ ...prev, title: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((categoryId: number) => {
    setNewTest((prev) => ({ ...prev, category_id: categoryId }));
  }, []);

  const handleAuthorChange = useCallback((authorId: number) => {
    setNewTest((prev) => ({ ...prev, author_id: authorId }));
  }, []);

  const reset = () => {
    setNewTest({
      title: "",
      is_private: false,
      questions: [] as Question[],
    });
    toast.info("Reset");
  };

  const handlePrivateToggle = useCallback(() => {
    setNewTest((prev) => ({ ...prev, is_private: !prev.is_private }));
  }, []);

  const handleQuestionAdd = useCallback(() => {
    const maxId = newTest.questions.reduce(
      (max, q) => (typeof q.id === "number" && q.id > max ? q.id : max),
      0,
    );

    const newQuestion: Question = {
      id: maxId + 1,
      text: "",
      answers: [] as Answer[],
      correctId: null,
    };

    setNewTest((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    toast.info(`Added question`);
  }, [newTest.questions]);

  const handleQuestionUpdate = useCallback(
    (questionId: number, text: string) => {
      setNewTest((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, text } : q,
        ),
      }));
    },
    [],
  );

  const handleAnswerAdd = useCallback((questionId: number) => {
    setNewTest((prev) => ({
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
      setNewTest((prev) => ({
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
      setNewTest((prev) => ({
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
    setNewTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  }, []);

  const handleAnswerSetCorrect = useCallback(
    (questionId: string | number, answerId: number) => {
      setNewTest((prev) => ({
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

  const handleOpenAlert = () => {
    setAlertOpen(true);
  };

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
              onClick={handlePrivateToggle}
              variant={newTest.is_private ? "destructive" : "secondary"}
              className="text-sm"
            >
              {newTest.is_private ? "Private" : "Public"}
            </Button>

            <Button variant="outline" onClick={reset}>
              <RefreshCw />
            </Button>
          </DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex flex-col gap-2">
            {user && user.role === "admin" && (
              <div className="flex gap-1">
                <Label>Author: </Label>
                <Select
                  onValueChange={(authorId) =>
                    handleAuthorChange(Number(authorId))
                  }
                  defaultValue={user.id.toString()}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Author" />
                  </SelectTrigger>
                  <SelectContent className="h-[200px]">
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-1">
              <Label>Category: </Label>
              <Select
                onValueChange={(categoryId) =>
                  handleCategoryChange(Number(categoryId))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="h-[200px]">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <Accordion type="multiple">
            {newTest.questions.map((question, i) => (
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
          <Button variant={"secondary"} onClick={handleOpenAlert}>
            <Save strokeWidth={2} />
            Create test
          </Button>
          <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will create a new test.
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
