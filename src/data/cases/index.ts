import type { Case } from "@/types";
import { midnightOffice } from "./midnight-office";
import { inheritanceParty } from "./inheritance-party";
import { missingTrainee } from "./missing-trainee";

/**
 * Static registry of all shipped cases.
 * To add a new case: create a data file and add it here. Nothing else.
 */
export const ALL_CASES: Case[] = [midnightOffice, inheritanceParty, missingTrainee];
