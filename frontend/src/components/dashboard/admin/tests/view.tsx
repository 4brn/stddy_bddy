import type { Question, Test } from "@schema";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";

function Question({ question }: { question: Question }) {
  const [show, setShow] = useState(false);
  return (
    <Card key={question.id} className="mb-2 w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="max-w-40 sm:max-w-80 flex-1 truncate overflow-hidden text-ellipsis whitespace-nowrap">
            {question.question}
          </span>
          <Button variant="outline" onClick={() => setShow(!show)}>
            {show ? <Eye /> : <EyeClosed />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2">
        {question.options.map((answer) => (
          <p key={answer.id}>
            {`${answer.id}) `}
            <span
              className={
                answer.id === question.correct && show
                  ? "bg-yellow-200"
                  : "bg-background"
              }
            >
              {answer.value}
            </span>
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

export default function View({
  open,
  onOpenChange,
  test,
}: {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  test: Test;
}) {
  const created = new Date(test.createdAt).toLocaleDateString();
  const updated = new Date(test.updatedAt).toLocaleDateString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start grid grid-cols-3 grid-rows-2 mr-3">
            <span
              title={test.title}
              className=" col-span-3 truncate overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {test.title}
            </span>

            <Badge
              variant={test.isPrivate ? "destructive" : "secondary"}
              className="text-sm"
            >
              {test.isPrivate ? "Private" : "Public"}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-start grid grid-cols-1 sm:grid-cols-2">
            <span>Id: {test.id}</span>
            <span>Created: {created}</span>
            <span>Author: {test.ownerId}</span>
            <span>Updated: {updated}</span>
          </DialogDescription>
        </DialogHeader>
        {/* <Separator /> */}
        <ScrollArea className="h-[60vh] w-full">
          {test.content.map((q) => {
            return <Question key={q.id} question={q} />;
          })}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
