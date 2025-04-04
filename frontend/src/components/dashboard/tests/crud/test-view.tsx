import type {
  Question,
  Test,
  User,
  Category,
} from "@shared/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function Question({ question }: { question: Question }) {
  const [show, setShow] = useState(false);
  return (
    <AccordionItem value={`${question.id}`}>
      <AccordionTrigger className="cursor-pointer">
        {question.text}
      </AccordionTrigger>
      <AccordionContent className="grid grid-cols-1 sm:grid-cols-2">
        {question.answers.map((a) => (
          <div key={a.id}>
            <span>{a.id}) </span>
            <span
              className={
                a.id === question.correctId && show
                  ? "bg-yellow-200 dark:text-muted"
                  : "bg-background"
              }
            >
              {a.value}
            </span>
          </div>
        ))}
        <div className="mt-3 sm:col-span-2">
          <span>$) </span>
          <button
            className="hover:underline cursor-pointer"
            onClick={() => setShow(!show)}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function TestView({
  open,
  onOpenChange,
  test,
  users,
  categories,
}: {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  test: Test;
  users: User[];
  categories: Category[];
}) {
  const created = new Date(test.created_at).toLocaleDateString();
  const updated = new Date(test.updated_at).toLocaleDateString();
  const author =
    users.find((u) => u.id === test.author_id)?.username ?? test.author_id;
  const category =
    categories.find((c) => c.id === test.category_id)?.name ??
    test.category_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start grid grid-rows-2 mr-3">
            <span title={test.title} className="truncate">
              {test.title}
            </span>
          </DialogTitle>
          <DialogDescription className="text-start grid grid-cols-1 sm:grid-cols-2">
            <span>Id: {test.id}</span>
            <span>Created: {created}</span>
            <span>Author: {author}</span>
            <span>Updated: {updated}</span>
            <span>Visibility: {test.is_private ? "Private" : "Public"}</span>
            <span>Cagetory: {category}</span>
          </DialogDescription>
        </DialogHeader>
        <Accordion type="multiple">
          <ScrollArea className="h-[40vh] w-full">
            {test.questions.map((q) => (
              <Question key={q.id} question={q} />
            ))}
          </ScrollArea>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
