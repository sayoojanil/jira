import React from "react";
import { Table, Typography } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

const { Title } = Typography;

interface Permission {
  key: string;
  permission: string;
  allowed: boolean;
}

const data: Permission[] = [
  { key: "1", permission: "View Dashboard", allowed: true },
  { key: "2", permission: "Create Projects", allowed: true },
  { key: "3", permission: "Edit Projects", allowed: true },
  { key: "4", permission: "Delete Projects", allowed: false },
  { key: "5", permission: "Archive Projects", allowed: false },
  { key: "6", permission: "View Tasks", allowed: true },
  { key: "7", permission: "Create Tasks", allowed: true },
  { key: "8", permission: "Edit Tasks", allowed: true },
  { key: "9", permission: "Delete Tasks", allowed: true },
  { key: "10", permission: "Assign Tasks", allowed: true },
  { key: "11", permission: "Create Milestones", allowed: true },
  { key: "12", permission: "Edit Milestones", allowed: true },
  { key: "13", permission: "Delete Milestones", allowed: false },
  { key: "14", permission: "Upload Files", allowed: true },
  { key: "15", permission: "Download Files", allowed: true },
  { key: "16", permission: "Add Comments", allowed: true },
  { key: "17", permission: "Edit Comments", allowed: true },
  { key: "18", permission: "Delete Comments", allowed: false },
  { key: "19", permission: "Manage Members", allowed: false },
  { key: "20", permission: "Invite Users", allowed: false },
  { key: "21", permission: "Remove Members", allowed: false },
  { key: "22", permission: "Manage Roles", allowed: false },
  { key: "23", permission: "Workspace Settings", allowed: false },
  { key: "24", permission: "Billing Access", allowed: false },
  { key: "25", permission: "API Access", allowed: true },
  { key: "26", permission: "View Activity Logs", allowed: true },
];

const columns = [
  {
    title: "Permission",
    dataIndex: "permission",
    key: "permission",
  },
  {
    title: "Access",
    dataIndex: "allowed",
    key: "allowed",
    align: "center" as const,
    width: 120,
    render: (allowed: boolean) =>
      allowed ? (
        <CheckCircleFilled
          style={{
            color: "#00F700",
            fontSize: 20,
          }}
        />
      ) : (
        <CloseCircleFilled
          style={{
            color: "#E90000",
            fontSize: 20,
          }}
        />
      ),
  },
];

const RolePermissions = () => {
  return (
    <div className="p-6">
      <Title level={3}>Developer Permissions</Title>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        size="middle"
      />
    </div>
  );
};

export default RolePermissions;