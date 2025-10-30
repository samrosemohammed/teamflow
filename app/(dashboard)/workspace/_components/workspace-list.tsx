"use client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";

export const WorkspaceList = () => {
  const {
    data: { workspaces, currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());
  console.log("WorkspaceList Rendered", workspaces);

  const workspacesColorVariants = [
    "bg-blue-500 hover:bg-blue-600 text-white",
    "bg-emerald-500 hover:bg-emerald-600 text-white" /*  */,
    "bg-purple-500 hover:bg-purple-600 text-white",
    "bg-amber-500 hover:bg-amber-600 text-white",
    "bg-rose-500 hover:bg-rose-600 text-white",
    "bg-indigo-500 hover:bg-indigo-600 text-white",
    "bg-cyan-500 hover:bg-cyan-600 text-white",
    "bg-pink-500 hover:bg-pink-600 text-white",
  ];

  const getWorkspaceColor = (id: number) => {
    const index = id % workspacesColorVariants.length;
    return workspacesColorVariants[index];
  };
  return (
    <div className="flex flex-col gap-2">
      {workspaces.map((workspace) => {
        const isActive = currentWorkspace.orgCode === workspace.id;
        return (
          <Tooltip key={workspace.id}>
            <TooltipTrigger asChild>
              <Button
                size={"icon"}
                className={cn(
                  "size-12 transition-all duration-200",
                  getWorkspaceColor(Number(workspace.id))
                )}
              >
                {workspace.avatar}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="text-sm font-semibold">
                {workspace.name} {isActive && "(Current)"}
              </span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
