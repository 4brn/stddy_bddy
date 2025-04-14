import type {
  Question,
  TestSelect as Test,
  TestCrud as Crud,
  CategorySelect as Category,
  UserSelect as User,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

import { useState, useCallback, useEffect, type ChangeEvent } from "react";
import { Ellipsis, Plus, RefreshCw, Save, Star, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { UpdateTestSchema } from "@/lib/validation";

interface TestEditProps {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  crud: Crud;
  test: Test;
  users: User[];
  categories: Category[];
}

export default function TestEdit({
  open,
  onOpenChange,
  crud,
  test,
  users,
  categories,
}: TestEditProps) {
  const { user } = useAuth()!;
  const [updatedTest, setUpdatedTest] = useState<Test>(test);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    setUpdatedTest(test);
  }, [test]);

  const created = new Date(test.created_at).toLocaleDateString();
  const updated = new Date(test.updated_at).toLocaleDateString();

  const handleSave = async () => {
    try {
      const { success, data, error } = UpdateTestSchema.safeParse(updatedTest);

      if (!success) {
        toast.error("Validation error");
        console.error(error);
        return;
      }

      const response = await fetch(
        `http://localhost:1337/api/tests/${test.id}`,
        {
          credentials: "include",
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        toast.error("Update failed");
        return;
      }

      const updatedData = await response.json();
      crud.update({ ...data, ...updatedData });
      toast.success(`Updated test (${updatedTest.id})`);
      setAlertOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleCategoryChange = useCallback((categoryId: number) => {
    setUpdatedTest((prev: any) => ({ ...prev, category_id: categoryId }));
  }, []);

  const handleAuthorChange = useCallback((authorId: number) => {
    setUpdatedTest((prev: any) => ({ ...prev, author_id: authorId }));
  }, []);

  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUpdatedTest((prev: any) => ({ ...prev, title: e.target.value }));
  }, []);

  const reset = () => {
    setUpdatedTest(test);
    toast.info("Reset");
  };

  const handlePrivateToggle = useCallback(() => {
    setUpdatedTest((prev: any) => ({ ...prev, is_private: !prev.is_private }));
  }, []);

  const handleQuestionAdd = useCallback(() => {
    const maxId = updatedTest.questions.reduce(
      (max: number, q: number) =>
        typeof q.id === "number" && q.id > max ? q.id : max,
      0,
    );

    const newQuestion: Question = {
      id: maxId + 1,
      text: "",
      answers: [],
      correctId: null,
    };

    setUpdatedTest((prev: any) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  }, [updatedTest.questions]);

  const handleQuestionUpdate = useCallback(
    (questionId: number, text: string) => {
      setUpdatedTest((prev: any) => ({
        ...prev,
        questions: prev.questions.map((q: any) =>
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
          <DialogDescription></DialogDescription>
          <div className="text-start flex flex-col gap-2 mt-2">
            <span>Id: {test.id}</span>
            {user && user.role === "admin" ? (
              <div className="flex gap-1">
                <span>Author: </span>
                <Select
                  onValueChange={(authorId) =>
                    handleAuthorChange(Number(authorId))
                  }
                  defaultValue={test.author_id.toString()}
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
            ) : (
              <span>Author: {test.author_id}</span>
            )}
            <div className="flex gap-1">
              <span>Category: </span>
              <Select
                onValueChange={(categoryId) =>
                  handleCategoryChange(Number(categoryId))
                }
                defaultValue={test.category_id.toString()}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="h-[200px]">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span>Updated: {updated}</span>
            <span>Created: {created}</span>
          </div>
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
                  <div
                    onClick={(e) => {
                      stopPropagation(e);
                      handleQuestionDelete(question.id);
                    }}
                    className="border-2 p-2 rounded-md bg-background hover:bg-accent"
                  >
                    <Trash size={18} color="red" />
                  </div>
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
