import React, { ReactNode } from "react";
import { WorkspaceList } from "./_components/workspace-list";
import { CreateWorkSpace } from "./_components/create-workspace";
import { UserNav } from "./_components/user-nav";

const WorkspaceLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex w-full h-screen">
      <div className="flex h-full w-16 bg-secondary flex-col items-center py-3 px-2 border-border">
        <WorkspaceList />
        <div className="mt-4">
          <CreateWorkSpace />
        </div>
        <div className="mt-auto">
          <UserNav />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
