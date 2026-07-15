import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IJuryAppealResponse,
  IJuryAssignmentResponse,
  IJuryCaseResponse,
  IJuryVoteResponse,
  JuryAppealCreateInput,
  JuryMineQuery,
  JuryVoteInput,
  PaginatedResponse,
  ReportableContentType,
} from '@network/shared';

export const juryApi = createApi({
  reducerPath: 'juryApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/jury' }),
  tagTypes: ['AssignedCases', 'Case', 'MyAppeals'],
  endpoints: (builder) => ({
    getAssignedCases: builder.query<
      ApiResponse<IJuryAssignmentResponse[]>,
      void
    >({
      query: () => ({ url: '/assigned', method: 'GET' }),
      providesTags: ['AssignedCases'],
    }),

    getCase: builder.query<ApiResponse<IJuryAssignmentResponse>, string>({
      query: (caseId) => ({ url: `/cases/${caseId}`, method: 'GET' }),
      providesTags: (_result, _error, caseId) => [{ type: 'Case', id: caseId }],
    }),

    castVote: builder.mutation<
      ApiResponse<IJuryVoteResponse>,
      { caseId: string } & JuryVoteInput
    >({
      query: ({ caseId, vote }) => ({
        url: `/cases/${caseId}/vote`,
        method: 'POST',
        data: { vote },
      }),
      invalidatesTags: (_result, _error, { caseId }) => [
        'AssignedCases',
        { type: 'Case', id: caseId },
      ],
    }),

    createAppeal: builder.mutation<
      ApiResponse<IJuryAppealResponse>,
      JuryAppealCreateInput
    >({
      query: (data) => ({ url: '/appeals', method: 'POST', data }),
      invalidatesTags: ['MyAppeals'],
    }),

    getMyAppeals: builder.query<
      PaginatedResponse<IJuryAppealResponse>,
      JuryMineQuery
    >({
      query: (params) => ({ url: '/appeals/mine', method: 'GET', params }),
      providesTags: ['MyAppeals'],
    }),

    getCaseForContent: builder.query<
      ApiResponse<IJuryCaseResponse | null>,
      { contentType: ReportableContentType; contentId: string }
    >({
      query: ({ contentType, contentId }) => ({
        url: `/cases/content/${contentType}/${contentId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetAssignedCasesQuery,
  useGetCaseQuery,
  useCastVoteMutation,
  useCreateAppealMutation,
  useGetMyAppealsQuery,
  useGetCaseForContentQuery,
  useLazyGetCaseForContentQuery,
} = juryApi;
