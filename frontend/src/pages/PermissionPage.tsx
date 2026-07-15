import React, { useMemo, useState } from "react";
import { Card, Input, Switch, Typography, Divider, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Permission {
  key: string;
  name: string;
  enabled: boolean;
}

interface PermissionGroup {
  title: string;
  permissions: Permission[];
}

const initialPermissions: PermissionGroup[] = [
  {
    title: "Dashboard",
    permissions: [
      {
        key: "view-dashboard",
        name: "View Dashboard",
        enabled: true,
      },
    ],
  },
  {
    title: "Projects",
    permissions: [
      {
        key: "create-project",
        name: "Create Projects",
        enabled: true,
      },
      {
        key: "edit-project",
        name: "Edit Projects",
        enabled: true,
      },
      {
        key: "delete-project",
        name: "Delete Projects",
        enabled: false,
      },
      {
        key: "archive-project",
        name: "Archive Projects",
        enabled: false,
      },
    ],
  },
  {
    title: "Tasks",
    permissions: [
      {
        key: "view-task",
        name: "View Tasks",
        enabled: true,
      },
      {
        key: "create-task",
        name: "Create Tasks",
        enabled: true,
      },
      {
        key: "edit-task",
        name: "Edit Tasks",
        enabled: true,
      },
      {
        key: "delete-task",
        name: "Delete Tasks",
        enabled: true,
      },
      {
        key: "assign-task",
        name: "Assign Tasks",
        enabled: true,
      },
    ],
  },
  {
    title: "Milestones",
    permissions: [
      {
        key: "create-milestone",
        name: "Create Milestones",
        enabled: true,
      },
      {
        key: "edit-milestone",
        name: "Edit Milestones",
        enabled: true,
      },
      {
        key: "delete-milestone",
        name: "Delete Milestones",
        enabled: false,
      },
    ],
  },
  {
    title: "Files",
    permissions: [
      {
        key: "upload-file",
        name: "Upload Files",
        enabled: true,
      },
      {
        key: "download-file",
        name: "Download Files",
        enabled: true,
      },
    ],
  },
  {
    title: "Comments",
    permissions: [
      {
        key: "add-comment",
        name: "Add Comments",
        enabled: true,
      },
      {
        key: "edit-comment",
        name: "Edit Comments",
        enabled: true,
      },
      {
        key: "delete-comment",
        name: "Delete Comments",
        enabled: false,
      },
    ],
  },
  {
    title: "Members",
    permissions: [
      {
        key: "manage-members",
        name: "Manage Members",
        enabled: false,
      },
      {
        key: "invite-users",
        name: "Invite Users",
        enabled: false,
      },
      {
        key: "remove-users",
        name: "Remove Members",
        enabled: false,
      },
    ],
  },
  {
    title: "Administration",
    permissions: [
      {
        key: "manage-roles",
        name: "Manage Roles",
        enabled: false,
      },
      {
        key: "workspace-settings",
        name: "Workspace Settings",
        enabled: false,
      },
      {
        key: "billing",
        name: "Billing Access",
        enabled: false,
      },
      {
        key: "api",
        name: "API Access",
        enabled: true,
      },
      {
        key: "activity",
        name: "View Activity Logs",
        enabled: true,
      },
    ],
  },
];

const PermissionPage: React.FC = () => {
  const [groups, setGroups] = useState(initialPermissions);
  const [search, setSearch] = useState("");

  const togglePermission = (
    groupIndex: number,
    permissionIndex: number,
    value: boolean
  ) => {
    const updated = [...groups];
    updated[groupIndex].permissions[permissionIndex].enabled = value;
    setGroups(updated);
  };

  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter((permission) =>
          permission.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groups, search]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card bordered={false} className="shadow-lg rounded-xl">

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <Title level={3} style={{ marginBottom: 0 }}>
              Roles & Permissions
            </Title>

            <Text type="secondary">
              Configure access for this role.
            </Text>
          </div>

          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search permission..."
            style={{ width: 280 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredGroups.map((group, groupIndex) => (
          <div key={group.title} className="mb-8">

            <Divider orientation="left">
              <Text strong>{group.title}</Text>
            </Divider>

            <div className="border rounded-lg overflow-hidden">

              <div className="grid grid-cols-2 bg-gray-100 px-5 py-3 font-semibold">
                <div>Permission</div>
                <div className="text-right">Allow</div>
              </div>

              {group.permissions.map((permission, permissionIndex) => (
                <div
                  key={permission.key}
                  className="grid grid-cols-2 items-center px-5 py-4 border-t hover:bg-gray-50 transition"
                >
                  <span>{permission.name}</span>

                  <div className="flex justify-end">
                    <Switch
                      checked={permission.enabled}
                      onChange={(value) =>
                        togglePermission(
                          groupIndex,
                          permissionIndex,
                          value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}

        <div className="flex justify-end gap-3 mt-8">
          <Button>Cancel</Button>

          <Button type="primary">
            Save Changes
          </Button>
        </div>

      </Card>
    </div>
  );
};

export default PermissionPage;