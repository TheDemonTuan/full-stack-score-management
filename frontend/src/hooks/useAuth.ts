import { useQuery } from "@tanstack/react-query";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { authVerify } from "@/api/auth";

export const useAuth = () => {
  const {
    data: authData,
    error: authError,
    isSuccess: authIsSuccess,
    isError: authIsError,
    isFetching: authIsFetching,
    isPending: authIsPending,
    isLoading: authIsLoading,
    refetch: authRefetch,
    isStale: authIsStale,
  } = useQuery<ApiSuccessResponse<UserResponse>, ApiErrorResponse, UserResponse>({
    queryKey: ["auth"],
    queryFn: async () => await authVerify(),
    select: (res) => res?.data,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    authData,
    authError,
    authIsFetching,
    authIsPending,
    authIsLoading,
    authIsSuccess,
    authIsError,
    authRefetch,
    authIsStale,
    authCanUse: !authIsLoading && authIsSuccess && authData,
  };
};
