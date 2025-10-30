import React, { ReactNode } from "react";
import { WorkspaceList } from "./_components/workspace-list";
import { CreateWorkSpace } from "./_components/create-workspace";
import { UserNav } from "./_components/user-nav";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";

const WorkspaceLayout = async ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(orpc.workspace.list.queryOptions());
  return (
    <div className="flex w-full h-screen">
      <div className="flex h-full w-16 bg-secondary flex-col items-center py-3 px-2 border-border">
        <HydrateClient client={queryClient}>
          <WorkspaceList />
        </HydrateClient>
        <div className="mt-4">
          <CreateWorkSpace />
        </div>
        <div className="mt-auto">
          <UserNav />
        </div>
      </div>
      <div>Page</div>
    </div>
  );
};

export default WorkspaceLayout;
