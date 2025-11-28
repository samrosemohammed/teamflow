import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Cloud, PlusCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

interface iAppProps {
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}
export const EmptyState = ({
  title,
  description,
  buttonText,
  href,
}: iAppProps) => {
  return (
    <Empty className="border border-border">
      <EmptyHeader>
        <EmptyMedia variant={"icon"} className="bg-primary/10">
          <Cloud className="size-5 text-primary" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link className={buttonVariants()} href={href}>
          <PlusCircle /> {buttonText}
        </Link>
      </EmptyContent>
    </Empty>
  );
};
