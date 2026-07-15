import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IReportResponse,
  PaginatedResponse,
  ReportCreateInput,
  ReportMineQuery,
} from '@network/shared';

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/reports' }),
  tagTypes: ['MyReports'],
  endpoints: (builder) => ({
    createReport: builder.mutation<
      ApiResponse<IReportResponse>,
      ReportCreateInput
    >({
      query: (data) => ({ url: '/', method: 'POST', data }),
      invalidatesTags: ['MyReports'],
    }),

    getMyReports: builder.query<
      PaginatedResponse<IReportResponse>,
      ReportMineQuery
    >({
      query: (params) => ({ url: '/mine', method: 'GET', params }),
      providesTags: ['MyReports'],
    }),
  }),
});

export const { useCreateReportMutation, useGetMyReportsQuery } = reportApi;
