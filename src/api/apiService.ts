import { toast } from "../utils/toast";

import { fetchWithAuth } from "./http";

import i18n from "../i18n";
import pkg from "../../package.json";
import type {
  Accesses,
  AttendanceAbsences,
  AttendanceVacation,
  Employee,
  EmployeeAttendanceTimes,
  EmployeeVisitor,
  EmployeeVisitorMotive,
  ManualOpenDoor,
  PushSubscriptionPayload,
  UserAuthorizationResponse,
} from "../types/Types";

export { BASE_URL, baseURL } from "./config";

export const version = pkg.version;

const toToastMessage = (value: unknown): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (value instanceof Error && value.message.trim().length > 0) {
    return value.message;
  }

  return i18n.t("api:Error");
};

const SUPPRESSED_ERROR_MESSAGES = new Set([
  "Sessão terminada noutro dispositivo.",
]);

// Toasts a serem mostrados quando ocorrem erros de API
const showErrorToast = (message: unknown) => {
  const normalizedMessage = toToastMessage(message);
  if (SUPPRESSED_ERROR_MESSAGES.has(normalizedMessage)) return;
  toast.error(normalizedMessage, {
    toastId: `api:error:${normalizedMessage}`,
  });
};

///////////////////////////////////////////////////////////////////////////////////////////////////////// EMPLOYEES /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const fetchAllEmployees = async (
  pageNo?: string,
  pageSize?: string,
  type?: string,
) => {
  const params: string[] = [];

  if (pageNo) {
    params.push(`pageNumber=${pageNo}`);
  }

  if (pageSize) {
    params.push(`pageSize=${pageSize}`);
  }

  if (type) {
    params.push(`type=${type}`);
  }

  let url = `Employees/GetEmployeesActiveInactiveAll`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const addEmployee = async (employee: Partial<Employee>) => {
  const response = await fetchWithAuth(`Employees/CreateEmployee`, {
    method: "POST",
    body: JSON.stringify(employee),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllRegisteredUsers = async (hasEmployee?: boolean) => {
  const params: string[] = [];

  if (hasEmployee !== undefined) {
    params.push(`hasEmployee=${hasEmployee}`);
  }

  let url = `Authentication/GetAllUsersWithRoles`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const getMeAuthorization =
  async (): Promise<UserAuthorizationResponse> => {
    const response = await fetchWithAuth("Authentication/MeAuthorization");
    if (!response.ok) {
      const errorData = await response.json();
      const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
      if (message) {
        toast.error(message || i18n.t("api:Error"), { toastId: "api-error" });
      } else {
        toast.error(
          errorData.message || errorData.error || i18n.t("api:Error"),
          {
            toastId: "api-error",
          },
        );
      }
      throw new Error();
    }
    return response.json();
  };

export const updateRegisteredUser = async (registeredUser: FormData) => {
  const response = await fetchWithAuth(`Authentication/UpdateUser`, {
    method: "PUT",
    body: registeredUser,
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllExternalEntities = async () => {
  const response = await fetchWithAuth(`ExternalEntities`);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////// LOGS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const fetchAllLoginLogs = async (
  startDate?: string,
  endDate?: string,
  userIds?: string[],
  pageNo?: string,
  pageSize?: string,
) => {
  const params: string[] = [];

  if (startDate && endDate) {
    params.push(`startDate=${startDate}`);
    params.push(`endDate=${endDate}`);
  }

  if (userIds) {
    userIds.forEach((userIds) => {
      params.push(`userIds=${userIds}`);
    });
  }

  if (pageNo && pageSize) {
    params.push(`pageNumber=${pageNo}`);
    params.push(`pageSize=${pageSize}`);
  }

  let url = `Configuration/GetAuthTasks`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllHistoryLogs = async (
  taskName?: string,
  startDate?: string,
  endDate?: string,
  userIds?: string[],
  pageNo?: string,
  pageSize?: string,
) => {
  const params: string[] = [];

  if (taskName) {
    params.push(`taskName=${taskName}`);
  }

  if (startDate && endDate) {
    params.push(`startDate=${startDate}`);
    params.push(`endDate=${endDate}`);
  }

  if (userIds) {
    userIds.forEach((userIds) => {
      params.push(`userIds=${userIds}`);
    });
  }

  if (pageNo && pageSize) {
    params.push(`pageNumber=${pageNo}`);
    params.push(`pageSize=${pageSize}`);
  }

  let url = `Configuration/GetHistoryUsers`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllEventDevice = async (
  deviceSN?: string[],
  startDate?: string,
  endDate?: string,
  pageNo?: string,
  pageSize?: string,
) => {
  const params: string[] = [];

  if (deviceSN) {
    deviceSN.forEach((deviceSN) => {
      params.push(`deviceSN=${deviceSN}`);
    });
  }

  if (startDate && endDate) {
    params.push(`startTime=${startDate}`);
    params.push(`endTime=${endDate}`);
  }

  if (pageNo && pageSize) {
    params.push(`pageNumber=${pageNo}`);
    params.push(`pageSize=${pageSize}`);
  }

  let url = `Zkteco/GetAllEventDevice`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    toast.error(errorData.message);
    throw new Error();
  }
  return response.json();
};

///////////////////////////////////////////////////////////////////////////////////////////////////////// ENTITIES /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const fetchAllEntidadesByNif = async () => {
  const response = await fetchWithAuth(`Configuration/GetEntidadesByNif`);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchCompanyLogo = async (selectedNif: number) => {
  const response = await fetchWithAuth(
    `Configuration/GetEntidadeImage?nif=${selectedNif}`,
  );
  if (!response.ok) {
    const errorData = await response.json();
    console.error(errorData.message || errorData.error);
    throw new Error();
  }
  return response.blob();
};

///////////////////////////////////////////////////////////////////////////////////////////////////////// LICENSES /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const fetchLicensesWithoutKey = async () => {
  const response = await fetchWithAuth(`Configuration/GetValidLisence`);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// ATTENDANCES /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const fetchAllAttendances = async (
  type?: number,
  pageNo?: string,
  pageSize?: string,
  enrollNumbers?: string[],
  startDate?: string,
  endDate?: string,
  onlyWithBuild?: boolean,
) => {
  const params: string[] = [];

  if (enrollNumbers) {
    enrollNumbers.forEach((enrollNumbers) => {
      params.push(`enrollNumbers=${enrollNumbers}`);
    });
  }

  if (startDate && endDate) {
    params.push(`startDate=${startDate}`);
    params.push(`endDate=${endDate}`);
  }

  if (pageNo && pageSize) {
    params.push(`pageNumber=${pageNo}`);
    params.push(`pageSize=${pageSize}`);
  }

  if (type) {
    params.push(`type=${type}`);
  }

  if (onlyWithBuild) {
    params.push(`onlyWithBuild=${onlyWithBuild}`);
  }

  let url = `Attendances/GetAllAttendances`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const addAttendance = async (attendance: EmployeeAttendanceTimes) => {
  const response = await fetchWithAuth(`Attendances/CreatedAttendanceTime`, {
    method: "POST",
    body: JSON.stringify(attendance),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAttendanceAbsence = async (
  attendanceAbsence?: Partial<AttendanceAbsences>,
) => {
  const response = await fetchWithAuth(`AttAusencias/GetAllAusencias`, {
    method: "POST",
    body: JSON.stringify(attendanceAbsence ?? {}),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const addAttendanceAbsence = async (
  attendanceAbsence: Partial<AttendanceAbsences>,
) => {
  const response = await fetchWithAuth(`AttAusencias/CreateAusencia`, {
    method: "POST",
    body: JSON.stringify(attendanceAbsence),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAttendanceVacation = async (
  startDate?: string,
  endDate?: string,
  enrollNumbers?: string[],
  pageNo?: string,
  pageSize?: string,
) => {
  const params: string[] = [];

  if (startDate && endDate) {
    params.push(`startDate=${startDate}`);
    params.push(`endDate=${endDate}`);
  }

  if (enrollNumbers) {
    enrollNumbers.forEach((enrollNumbers) => {
      params.push(`enrollNumbers=${enrollNumbers}`);
    });
  }

  if (pageNo && pageSize) {
    params.push(`pageNumber=${pageNo}`);
    params.push(`pageSize=${pageSize}`);
  }

  let url = `Ferias/GetFerias`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const addAttendanceVacation = async (
  attendanceVacation: Partial<AttendanceVacation>,
) => {
  const response = await fetchWithAuth(`Ferias/CreateFerias`, {
    method: "POST",
    body: JSON.stringify(attendanceVacation),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAttendanceCodes = async (
  tipo?: string,
  pageNo?: string,
  pageSize?: string,
) => {
  const params: string[] = [];

  if (tipo) {
    params.push(`Tipo=${tipo}`);
  }

  if (pageNo && pageSize) {
    params.push(`pageNumber=${pageNo}`);
    params.push(`pageSize=${pageSize}`);
  }

  let url = `AttCodigos/GetCodigoByTipo`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

///////////////////////////////////////////////////////////////////////////////////////////////////////// ACCESSES /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const fetchAllAccesses = async (
  deviceSNList?: string[],
  enrollNumbers?: string[],
  doorIds?: string[],
  readerIds?: string[],
  modules?: number[],
  startDate?: string,
  endDate?: string,
  tipo?: string,
  pageNo?: string,
  pageSize?: string,
  exportPdf?: boolean,
) => {
  const params: string[] = [];

  if (deviceSNList) {
    deviceSNList.forEach((deviceSNList) => {
      params.push(`deviceSNList=${deviceSNList}`);
    });
  }

  if (enrollNumbers) {
    enrollNumbers.forEach((enrollNumbers) => {
      params.push(`enrollNumbers=${enrollNumbers}`);
    });
  }

  if (doorIds) {
    doorIds.forEach((doorIds) => {
      params.push(`doorIds=${doorIds}`);
    });
  }

  if (readerIds) {
    readerIds.forEach((readerIds) => {
      params.push(`readerIds=${readerIds}`);
    });
  }

  if (modules) {
    modules.forEach((modules) => {
      params.push(`modules=${modules}`);
    });
  }

  if (startDate && endDate) {
    params.push(`startTime=${startDate}`);
    params.push(`endTime=${endDate}`);
  }

  if (tipo) {
    params.push(`Tipo=${tipo}`);
  }

  if (pageNo && pageSize) {
    params.push(`pageNumber=${pageNo}`);
    params.push(`pageSize=${pageSize}`);
  }

  if (exportPdf) {
    params.push(`exportPdf=${exportPdf}`);
  }

  let url = `AccPlanoAcesso/GetTransactionsByEnrollDeviceSN`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    toast.error(errorData.message);
    throw new Error();
  }
  if (exportPdf) {
    return response.blob();
  }
  return response.json();
};

export const addAccessTransaction = async (access: Partial<Accesses>) => {
  const response = await fetchWithAuth(`KioskTransaction/AddTransaction`, {
    method: "POST",
    body: JSON.stringify(access),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllEmployeeVisitors = async (
  startDate?: string,
  endDate?: string,
  pageNo?: string,
  pageSize?: string,
  employeeIds?: string[],
) => {
  const params: string[] = [];

  if (startDate && endDate) {
    params.push(`startTime=${startDate}`);
    params.push(`endTime=${endDate}`);
  }

  if (pageNo && pageSize) {
    params.push(`pageNumber=${pageNo}`);
    params.push(`pageSize=${pageSize}`);
  }

  if (employeeIds) {
    params.push(`employeeIds=${employeeIds}`);
  }

  let url = `Employees/GetAllEmployeeVisitors`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const addEmployeeVisitor = async (
  employee: Partial<EmployeeVisitor>,
) => {
  const response = await fetchWithAuth(`Employees/CreateEmployeeVisitor`, {
    method: "POST",
    body: JSON.stringify(employee),
  });
  if (!response.ok) {
    const errorData = await response.json();
    toast.error(errorData.error);
    throw new Error();
  }
  return response.json();
};

export const updateEmployeeVisitor = async (
  employee: Partial<EmployeeVisitor>,
) => {
  const response = await fetchWithAuth(`Employees/UpdateEmployeeVisitor`, {
    method: "PUT",
    body: JSON.stringify(employee),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchEmployeeVisitorMotive = async () => {
  const response = await fetchWithAuth(`Employees/GetAllVisitanteMotivo`);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const addEmployeeVisitorMotive = async (
  employee: Partial<EmployeeVisitorMotive>,
) => {
  const response = await fetchWithAuth(`Employees/CreateVisitantesMotivo`, {
    method: "POST",
    body: JSON.stringify(employee),
  });
  if (!response.ok) {
    const errorData = await response.json();
    toast.error(errorData.error);
    throw new Error();
  }
  return response.json();
};

///////////////////////////////////////////////////////////////////////////////////////////////////////// DEVICES /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const fetchAllDevices = async () => {
  const response = await fetchWithAuth(`Zkteco/GetAllDevices`);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllDoors = async () => {
  const response = await fetchWithAuth(`AccDoor`);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllManualDoorOpen = async (
  startDate?: string,
  endDate?: string,
  tipo?: string,
  deviceIds?: string[],
  pageNo?: string,
  pageSize?: string,
) => {
  const params: string[] = [];

  if (startDate && endDate) {
    params.push(`startTime=${startDate}`);
    params.push(`endTime=${endDate}`);
  }

  if (tipo) {
    params.push(`Tipo=${tipo}`);
  }

  if (deviceIds) {
    deviceIds.forEach((deviceIds) => {
      params.push(`deviceIds=${deviceIds}`);
    });
  }

  if (pageNo && pageSize) {
    params.push(`pageNumber=${pageNo}`);
    params.push(`pageSize=${pageSize}`);
  }

  let url = `KioskTransaction/GetAllAberturaDistanciaAsync`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const addManualOpenDoor = async (door: Partial<ManualOpenDoor>) => {
  const response = await fetchWithAuth(
    `KioskTransaction/CreateAberturaDistanciaAsync`,
    {
      method: "POST",
      body: JSON.stringify(door),
    },
  );
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllPatrolDevice = async () => {
  const response = await fetchWithAuth(`Patrol/GetAllPtlTerminais`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllAccessControl = async () => {
  const response = await fetchWithAuth(`AccPlanoAcesso/GetAllAccPlanoAcesso`);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export type DeviceCommandAsyncResponse = {
  message: string;
  queuedDeviceIds: string[];
  rejected: { deviceId: string; reason: string }[];
};

export const sendEmployeesToDevices = async (
  employeeIds?: string[],
  enrollNumber?: string[],
  deviceIds?: string[],
) => {
  const params: string[] = [];

  if (employeeIds) {
    employeeIds.forEach((employeeIds) => {
      params.push(`employeeIds=${employeeIds}`);
    });
  }

  if (enrollNumber) {
    enrollNumber.forEach((enrollNumber) => {
      params.push(`enrollNumber=${enrollNumber}`);
    });
  }

  if (deviceIds) {
    deviceIds.forEach((deviceIds) => {
      params.push(`deviceIds=${deviceIds}`);
    });
  }

  let url = `Zkteco/SendEmployeesToDevices`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const sendEmployeesToDevicesAsync = async (
  employeeIds?: string[],
  enrollNumber?: string[],
  deviceIds?: string[],
): Promise<DeviceCommandAsyncResponse> => {
  const params: string[] = [];

  if (employeeIds) {
    employeeIds.forEach((employeeIds) => {
      params.push(`employeeIds=${employeeIds}`);
    });
  }

  if (enrollNumber) {
    enrollNumber.forEach((enrollNumber) => {
      params.push(`enrollNumber=${enrollNumber}`);
    });
  }

  if (deviceIds) {
    deviceIds.forEach((deviceIds) => {
      params.push(`deviceIds=${deviceIds}`);
    });
  }

  let url = `Zkteco/SendEmployeesToDevicesAsync`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export type DeviceActivity = {
  [key: string]: any;
  deviceSN: string;
  estado: string;
  createdDate: string;
};

export const fetchAllDeviceActivities = async (
  ids: string[],
): Promise<DeviceActivity[]> => {
  const params = ids.map((id) => `ids=${id}`).join("&");
  const url = `Zkteco/GetAllDeviceActivities${params ? `?${params}` : ""}`;

  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// NOTIFICATIONS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const fetchAllNotifications = async (
  unreadOnly?: boolean,
  pageNumber?: number,
  pageSize?: number,
) => {
  const params: string[] = [];

  if (unreadOnly != null) {
    params.push(`unreadOnly=${unreadOnly}`);
  }

  if (pageNumber) {
    params.push(`pageNumber=${pageNumber}`);
  }

  if (pageSize) {
    params.push(`pageSize=${pageSize}`);
  }

  let url = `notifications`;
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await fetchWithAuth(url, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const fetchAllUnreadCount = async () => {
  const response = await fetchWithAuth(`notifications`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const updateNotificationsRead = async (id: string) => {
  const response = await fetchWithAuth(`notifications/${id}/read`, {
    method: "PUT",
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const updateNotificationsDismiss = async (id: string) => {
  const response = await fetchWithAuth(`notifications/${id}/dismiss`, {
    method: "PUT",
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const updateNotificationsReadAll = async () => {
  const response = await fetchWithAuth(`notifications/read-all`, {
    method: "PUT",
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const updateNotificationsDismissAll = async () => {
  const response = await fetchWithAuth(`notifications/dismiss-all`, {
    method: "PUT",
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const updateNotificationsSubscribe = async (
  payload: PushSubscriptionPayload,
) => {
  const response = await fetchWithAuth(`push-notifications/subscribe`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};

export const deleteNotificationsUnsubscribe = async (endpoint: string) => {
  const response = await fetchWithAuth(`push-notifications/unsubscribe`, {
    method: "DELETE",
    body: JSON.stringify({ endpoint }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData?.error?.[""]?.errors?.[0]?.errorMessage;
    if (message) {
      showErrorToast(message || i18n.t("api:Error"));
    } else {
      showErrorToast(
        errorData.message || errorData.error || i18n.t("api:Error"),
      );
    }
    throw new Error();
  }
  return response.json();
};
