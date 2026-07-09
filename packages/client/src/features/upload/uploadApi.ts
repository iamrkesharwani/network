import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  InitiateMultipartUploadInput,
  IInitiateMultipartUploadResult,
  ResumeMultipartUploadInput,
  IResumeMultipartUploadResult,
  IPresignPartResult,
  CompletePartInput,
  CompleteMultipartUploadInput,
  ICompleteMultipartUploadResult,
} from '@network/shared';

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/uploads' }),
  endpoints: (builder) => ({
    initiateMultipartUpload: builder.mutation<
      ApiResponse<IInitiateMultipartUploadResult>,
      InitiateMultipartUploadInput
    >({
      query: (data) => ({
        url: '/initiate',
        method: 'POST',
        data,
      }),
    }),

    resumeMultipartUpload: builder.mutation<
      ApiResponse<IResumeMultipartUploadResult>,
      ResumeMultipartUploadInput
    >({
      query: (data) => ({
        url: '/resume',
        method: 'POST',
        data,
      }),
    }),

    presignUploadPart: builder.mutation<
      ApiResponse<IPresignPartResult>,
      { sessionId: string; partNumber: number }
    >({
      query: ({ sessionId, partNumber }) => ({
        url: `/${sessionId}/parts/${partNumber}`,
        method: 'GET',
      }),
    }),

    completeUploadPart: builder.mutation<
      ApiResponse<null>,
      { sessionId: string; partNumber: number } & CompletePartInput
    >({
      query: ({ sessionId, partNumber, etag, size }) => ({
        url: `/${sessionId}/parts/${partNumber}`,
        method: 'POST',
        data: { etag, size },
      }),
    }),

    completeMultipartUpload: builder.mutation<
      ApiResponse<ICompleteMultipartUploadResult>,
      { sessionId: string } & CompleteMultipartUploadInput
    >({
      query: ({ sessionId, parts }) => ({
        url: `/${sessionId}/complete`,
        method: 'POST',
        data: { parts },
      }),
    }),

    abortMultipartUpload: builder.mutation<
      ApiResponse<null>,
      { sessionId: string }
    >({
      query: ({ sessionId }) => ({
        url: `/${sessionId}/abort`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useInitiateMultipartUploadMutation,
  useResumeMultipartUploadMutation,
  usePresignUploadPartMutation,
  useCompleteUploadPartMutation,
  useCompleteMultipartUploadMutation,
  useAbortMultipartUploadMutation,
} = uploadApi;
