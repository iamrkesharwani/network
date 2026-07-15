import mongoose from 'mongoose';
import {
  JuryAssignmentModel,
  type IJuryAssignmentDocument,
} from '../models/jury-assignment.model.js';
import type { JuryVoteChoice } from '@network/shared';

export const createMany = (
  caseId: string,
  jurorIds: string[]
): Promise<IJuryAssignmentDocument[]> =>
  JuryAssignmentModel.insertMany(
    jurorIds.map((jurorId) => ({
      caseId: new mongoose.Types.ObjectId(caseId),
      jurorId: new mongoose.Types.ObjectId(jurorId),
    }))
  );

export const findForCaseAndJuror = (
  caseId: string,
  jurorId: string
): Promise<IJuryAssignmentDocument | null> =>
  JuryAssignmentModel.findOne({
    caseId: new mongoose.Types.ObjectId(caseId),
    jurorId: new mongoose.Types.ObjectId(jurorId),
  }).exec();

export const findForCase = (
  caseId: string
): Promise<IJuryAssignmentDocument[]> =>
  JuryAssignmentModel.find({
    caseId: new mongoose.Types.ObjectId(caseId),
  }).exec();

export const findAssignedJurorIds = async (
  caseId: string
): Promise<string[]> => {
  const assignments = await findForCase(caseId);
  return assignments.map((a) => a.jurorId.toString());
};

export const recordVote = async (
  caseId: string,
  jurorId: string,
  vote: JuryVoteChoice
): Promise<IJuryAssignmentDocument | null> =>
  JuryAssignmentModel.findOneAndUpdate(
    {
      caseId: new mongoose.Types.ObjectId(caseId),
      jurorId: new mongoose.Types.ObjectId(jurorId),
      vote: null,
    },
    { $set: { vote, votedAt: new Date() } },
    { returnDocument: 'after' }
  ).exec();

export const countVotes = async (
  caseId: string
): Promise<{ remove: number; noAction: number; total: number }> => {
  const assignments = await findForCase(caseId);
  const voted = assignments.filter((a) => a.vote !== null);
  const remove = voted.filter((a) => a.vote === 'remove').length;
  const noAction = voted.filter((a) => a.vote === 'no_action').length;
  return { remove, noAction, total: voted.length };
};

export const findJurorIdsVotedSince = async (
  since: Date
): Promise<string[]> => {
  const ids = await JuryAssignmentModel.distinct('jurorId', {
    votedAt: { $gte: since },
  }).exec();
  return (ids as mongoose.Types.ObjectId[]).map((id) => id.toString());
};

export const findOpenAssignmentsForJuror = async (
  jurorId: string
): Promise<IJuryAssignmentDocument[]> =>
  JuryAssignmentModel.find({
    jurorId: new mongoose.Types.ObjectId(jurorId),
    vote: null,
  }).exec();
