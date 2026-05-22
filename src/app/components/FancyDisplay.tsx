import { Card } from "@heroui/react";
import { cn } from "@heroui/styles";
import { MdWhatshot } from "react-icons/md";

export default function FancyDisplay({
  currentStreak,
}: {
  currentStreak: number;
}) {
  return (
    <div
      id="container"
      className={cn(
        "p-0",
        "m-0",
        "grid",
        "grid-rows-3",
        "grid-cols-3",
        "justify-items-center",
        "",
        "",
      )}
    >
      <div
        id="highlight-circle-outline"
        className={cn(
          "flex",
          "justify-center",
          "items-center",
          "rounded-full",
          "border-4",
          "mt-2",
          "border-accent-primary",
          "size-20",
          "col-start-1",
          "col-span-full",
          "row-start-1",
          "row-span-full",
          "",
          "",
        )}
      >
        <div id="content" className={cn(" text-primary")}>
          {currentStreak ? currentStreak.toString() : "XX"}
        </div>
      </div>
      <Card
        className={cn(
          "py-0",
          "px-1",
          "size-6",
          "rounded-full",
          "col-start-2",
          "row-start-1",
          "items-center",
          "",
          "",
        )}
      >
        <MdWhatshot
          className={cn(
            "font-black",
            "text-accent-secondary",
            "text-xl font-light",
          )}
        />
      </Card>
    </div>
  );
}
