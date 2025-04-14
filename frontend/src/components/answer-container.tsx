import { Question } from "@shared/types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Asterisk } from "lucide-react";

import { Answer } from "@shared/types";
import { Button } from "./ui/button";

export function AnswerButton({
  selected,
  handleSelect,
  answer,
}: {
  selected: boolean;
  handleSelect: () => void;
  answer: Answer;
}) {
  return (
    <Button
      size={"lg"}
      variant={"ghost"}
      className={`justify-start gap-2 ${selected ? "bg-yellow-200/70 hover:bg-yellow-200/70! text-gray-700! rounded-sm" : ""}`}
      onClick={handleSelect}
    >
      {answer.id}) {answer.value}
    </Button>
  );
}

export default function AnswersContainer({
  question,
  selectedAnswer,
  onAnswerSelect,
}: {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (questionId: number, answerId: number) => void;
}) {
  return (
    <AccordionItem value={`${question.id}`}>
      <AccordionTrigger className="cursor-pointer sm:text-lg text-wrap break-words">
        <div className="text-left w-full flex gap-2 justify-between">
          {question.text}
          {selectedAnswer && (
            <span className="w-6">
              <Asterisk color="#33d17a" strokeWidth={2} size={24} />
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="grid grid-cols-1 text-lg gap-2 sm:grid-cols-2">
        {question.answers.map((a) => (
          <AnswerButton
            key={a.id}
            selected={selectedAnswer === a.id}
            handleSelect={() => onAnswerSelect(question.id, a.id)}
            answer={a}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
