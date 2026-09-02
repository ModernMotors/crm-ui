import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

// Generic hook for fetching data
export function useApiQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error, T, any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

// Generic hook for mutations
export function useApiMutation<T, V = any>(
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: Error, variables: V) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables);
    },
    onError: (error: Error, variables) => {
      options?.onError?.(error, variables);
    },
  });
}

// Specific hooks for different entities
export function useSettings(filters?: any) {
  return useApiQuery(
    ['settings', filters],
    () => apiClient.getSettings(filters)
  );
}

export function usePublicSettings() {
  return useApiQuery(
    ['public-settings'],
    () => apiClient.getPublicSettings(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useBranches(filters?: any) {
  return useApiQuery(
    ['branches', filters],
    () => apiClient.getBranches(filters)
  );
}

export function useBranch(id: string) {
  return useApiQuery(
    ['branch', id],
    () => apiClient.getBranch(id),
    {
      enabled: !!id,
    }
  );
}

export function useVehicles(filters?: any) {
  return useApiQuery(
    ['vehicles', filters],
    () => apiClient.getVehicles(filters)
  );
}

export function useVehicle(id: string) {
  return useApiQuery(
    ['vehicle', id],
    () => apiClient.getVehicle(id),
    {
      enabled: !!id,
    }
  );
}

export function useAppointments(filters?: any) {
  return useApiQuery(
    ['appointments', filters],
    () => apiClient.getAppointments(filters)
  );
}

export function useAppointment(id: string) {
  return useApiQuery(
    ['appointment', id],
    () => apiClient.getAppointment(id),
    {
      enabled: !!id,
    }
  );
}

export function useContacts(filters?: any) {
  return useApiQuery(
    ['contacts', filters],
    () => apiClient.getContacts(filters)
  );
}

export function useContact(id: string) {
  return useApiQuery(
    ['contact', id],
    () => apiClient.getContact(id),
    {
      enabled: !!id,
    }
  );
}

export function usePhoneCalls(filters?: any) {
  return useApiQuery(
    ['phone-calls', filters],
    () => apiClient.getPhoneCalls(filters)
  );
}

export function usePhoneCall(id: string) {
  return useApiQuery(
    ['phone-call', id],
    () => apiClient.getPhoneCall(id),
    {
      enabled: !!id,
    }
  );
}

export function useTickets(filters?: any) {
  return useApiQuery(
    ['tickets', filters],
    () => apiClient.getTickets(filters)
  );
}

export function useTicket(id: string) {
  return useApiQuery(
    ['ticket', id],
    () => apiClient.getTicket(id),
    {
      enabled: !!id,
    }
  );
}
