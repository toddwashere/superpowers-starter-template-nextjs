import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  billing: ["manage"],
  apiKey: ["create", "revoke"],
} as const;

export const ac = createAccessControl(statement);

export const permissions = {
  owner: ac.newRole({
    organization: ["update", "delete"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    billing: ["manage"],
    apiKey: ["create", "revoke"],
  }),
  admin: ac.newRole({
    organization: ["update"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    billing: ["manage"],
    apiKey: ["create", "revoke"],
  }),
  member: ac.newRole({
    organization: [],
    member: [],
    invitation: [],
    billing: [],
    apiKey: [],
  }),
};
