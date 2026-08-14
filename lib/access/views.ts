import "server-only";

import { authorizeDelegatedRead } from "./data";
import { redactDelegatedTrainingContext } from "./redact";
import { getTrainingContext } from "../training-context/data";
import type { TrainingContext } from "../training-context/model";

export async function getDelegatedTrainingContext(input: Readonly<{
  grantId: string;
  recipientUserId: string;
  oauthClientId?: string;
  asOf: Date;
  utcOffsetMinutes: number;
  historyDays: number;
}>): Promise<TrainingContext | null> {
  const access = await authorizeDelegatedRead({
    grantId: input.grantId,
    recipientUserId: input.recipientUserId,
    permission: "training",
    resourceType: "training_context",
    oauthClientId: input.oauthClientId,
  });
  if (!access) return null;
  const context = await getTrainingContext({
    userId: access.ownerUserId,
    asOf: input.asOf,
    utcOffsetMinutes: input.utcOffsetMinutes,
    historyDays: input.historyDays,
  });
  return redactDelegatedTrainingContext(context, access.grant.permissions);
}
