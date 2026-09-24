export type Employee = {
  [key: string]: any;
  id: string;
  enrollNumber: string;
  name: string;
  shortName: string;
  nameAcronym: string;
  comments: string;
  photo: string;
  address: string;
  zipcode: string;
  locality: string;
  village: string;
  district: string;
  phone: number;
  mobile: number;
  email: string;
  birthday: Date;
  nacionality: string;
  gender: string;
  biNumber: string;
  allowPhotoFetch: boolean;
  biIssuance: Date;
  biValidity: Date;
  nif: number;
  admissionDate: Date;
  exitDate: Date;
  rgpdAut: boolean;
  hourlyCost: number;
  status: boolean;
  statusEmail: boolean;
  statusFprint: boolean;
  statusFace: boolean;
  statusPalm: boolean;
  type: string;
  employeeCards: EmployeeCard[];
  enabledModulesDisplay: number | string[];
  employeeModulesDisplay: number | string[];
  entidadeId: string;
  entidadeName: string;
  departmentId: string;
  departmentName: string;
  professionId: string;
  professionName: string;
  categoryId: string;
  categoryName: string;
  groupId: string;
  groupName: string;
  zoneId: string;
  zoneName: string;
  externalEntityId: string;
  externalEntityName: string;
  accPlanoAcessoId: string;
  accPlanoAcessoName: string;
  attPlanoTrabalhoId: string;
  attPlanoTrabalhoName: string;
  responsavelIds: string[];
  subordinadoIds: string[];
  bldObraIds: string[];
  account: EmployeeAccount;
  signature: boolean;
};

export type EmployeeCard = {
  cardId: string;
  employeeId: string;
  enrollNumber: string;
  employeeName: string;
  devicePassword: string;
  devicePrivelage: number;
  deviceEnabled: boolean;
  cardNumber: string;
};

export type EmployeeAccount = {
  createLogin: boolean;
  userName: string;
  email: string;
  password: string;
  role: string;
};

export type SoftwareProduct = {
  enable: boolean;
  validacao: number;
  createDate: string;
  pacote: string | null;
};

export type License = {
  [key: string]: any;
  id?: string;
  entidadeNumber: number;
  name: string;
  nif: number;
  employees: number;
  devices: number;
  sn: string;
  nclock: SoftwareProduct;
  naccess: SoftwareProduct;
  nvisitor: SoftwareProduct;
  npark: SoftwareProduct;
  ndoor: SoftwareProduct;
  npatrol: SoftwareProduct;
  ncard: SoftwareProduct;
  nview: SoftwareProduct;
  nsecur: SoftwareProduct;
  nsmart: SoftwareProduct;
  nreality: SoftwareProduct;
  nhologram: SoftwareProduct;
  npower: SoftwareProduct;
  ncharge: SoftwareProduct;
  ncity: SoftwareProduct;
  nkiosk: SoftwareProduct;
  nled: SoftwareProduct;
  nfire: SoftwareProduct;
  nfurniture: SoftwareProduct;
  npartition: SoftwareProduct;
  ndecor: SoftwareProduct;
  nping: SoftwareProduct;
  nconnect: SoftwareProduct;
  nlight: SoftwareProduct;
  ncomfort: SoftwareProduct;
  nsound: SoftwareProduct;
  nhome: SoftwareProduct;
  nsoftware: SoftwareProduct;
  nsystem: SoftwareProduct;
  napp: SoftwareProduct;
  ncyber: SoftwareProduct;
  ndigital: SoftwareProduct;
  nserver: SoftwareProduct;
  naut: SoftwareProduct;
  nequip: SoftwareProduct;
  nproject: SoftwareProduct;
  ncount: SoftwareProduct;
  nbuild: SoftwareProduct;
  ncaravan: SoftwareProduct;
  nmechanic: SoftwareProduct;
  nevents: SoftwareProduct;
  nservice: SoftwareProduct;
  ntask: SoftwareProduct;
  nproduction: SoftwareProduct;
  nticket: SoftwareProduct;
  nsales: SoftwareProduct;
  ninvoice: SoftwareProduct;
  ndoc: SoftwareProduct;
  nsports: SoftwareProduct;
  ngym: SoftwareProduct;
  nschool: SoftwareProduct;
  nclinic: SoftwareProduct;
  noptics: SoftwareProduct;
  ngold: SoftwareProduct;
  nstore: SoftwareProduct;
};

export type EmployeeAttendanceTimes = {
  [key: string]: any;
  id: string;
  deviceId: string;
  deviceName: string;
  employeeId: string;
  enrollNumber: string;
  employeeName: string;
  inOutMode: number;
  workCode: number;
  observation: string;
  type: number;
  verifyMode: number;
  attendanceTime: Date | string;
  attendanceDate: string;
  attendanceHour: string;
  buildId: string;
  geoLat: number;
  geoLng: number;
  signatureBase64: string;
  signatureUrl: string;
  responsavelId: string;
};

export type AttendanceAbsences = {
  [key: string]: any;
  id: number;
  idPessoa: string;
  idDep: string;
  idg: string;
  data: Date;
  dataInicio: Date;
  dataFim: Date;
  dataPedido: Date;
  diaProcessa: number;
  dataValidado: Date;
  idValidado: number;
  validado: number;
  idPlano: string;
  idHorario: string;
  idCod: number;
  tipo: number;
  tipoDiv: number;
  tipoDivHoras: Date;
  tipoDivFraccao: number;
  dataRespValidado: Date;
  respValidado: number;
  idRespValidado: string;
  dataInserido: Date;
  idInserido: string;
  pagar: boolean;
  idPAutPag: number;
  credFeriasMesAnterior: boolean;
  anoOrigem: number;
  obs: string;
  obsResp: string;
  obsFinal: string;
  createdAt: Date;
  idPessoas: string[];
};

export type AttendanceVacation = {
  [key: string]: any;
  ids: number[];
  idCod: number;
  ano: number;
  dataInicio: Date;
  dataFim: Date;
  idPessoa: string;
  idDep: string;
  idg: string;
  dataPedido: Date;
  dataValidado: Date;
  idValidado: string;
  validado: number;
  dataRespValidado: Date;
  idRespValidado: string;
  respValidado: number;
  obsResp: string;
  obsFinal: string;
  obs: string;
  TStamp: Date;
};

export type AttendanceCodes = {
  [key: string]: any;
  id: number;
  tipo: number;
  subTipo: number;
  sigla: string;
  codigo: string;
  descricao: string;
  cor: string;
  exporta: string;
  rate: number;
  unidade: number;
  descSubAlim: boolean;
  descSubTurno: boolean;
  saldoIgnora: boolean;
  bhAuto: boolean;
  bm: boolean;
  credResto: boolean;
  credRestoEfectivo: boolean;
  transCredDesc: boolean;
  hn: boolean;
  tStamp: Date;
  rem: boolean;
};

export type GeoLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
  address?: string | null;
};

export type Logs = {
  [key: string]: any;
  userId: string;
  userName: string;
  taskName: string;
  description: string;
  createdDate: Date;
};

export type Register = {
  [key: string]: any;
  id: string;
  name: string;
  userName: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
  role: string;
  profileImage: string;
};

export type Accesses = {
  [key: string]: any;
  id: string;
  eventDate: string;
  eventTime: string;
  cardNo: string;
  nameUser: string;
  pin: string;
  deviceSN: string;
  deviceName: string;
  eventName: string;
  eventDoorId: string;
  eventDoorName: string;
  readerName: string;
};

export type Devices = {
  [key: string]: any;
  id: string;
  deviceNumber: number;
  deviceName: string;
  model: string;
  ipAddress: string;
  ipServidor: string;
  photo: string;
  port: number;
  code: number;
  platform: string;
  firmware: string;
  macAddress: string;
  serialNumber: string;
  readerCount: number;
  auxInCount: number;
  auxOutCount: number;
  maxUserCount: number;
  maxAttLogCount: number;
  maxFingerCount: number;
  maxUserFingerCount: number;
  faceAlg: number;
  fpAlg: number;
  productTime: Date;
  producter: string;
  deviceProtocol: number;
  deviceType: number;
  status: boolean;
  disabled: boolean;
};

export type Doors = {
  [key: string]: any;
  id: string;
  companyId: string;
  createTime: Date;
  createrCode: string;
  createrId: string;
  createrName: string;
  opVersion: number;
  updateTime: Date;
  updaterCode: string;
  updaterId: string;
  updaterName: string;
  actionInterval: number;
  activeTimesegId: string;
  allowSuaccessLock: string;
  backLock: boolean;
  combopenInterval: number;
  delayOpenTime: number;
  doorNo: number;
  doorSensorStatus: number;
  enabled: boolean;
  extDelayDrivertime: number;
  extDevId: string;
  forcePwd: string;
  hostStatus: number;
  inApbDuration: number;
  isDisableAudio: boolean;
  latchDoorType: number;
  latchTimeOut: number;
  latchTimesegId: string;
  lockDelay: number;
  name: string;
  passmodeTimesegId: string;
  readerType: number;
  sexInputMode: string;
  sexSupervisedResistor: string;
  senInputMode: string;
  senSupervisedResistor: string;
  sensorDelay: number;
  supperPwd: string;
  verifyMode: number;
  wgInputId: string;
  wgInputType: number;
  wgOutputId: string;
  wgOutputType: number;
  wgReversed: number;
  devId: string;
  devSN: string;
};

export type ManualOpenDoor = {
  [key: string]: any;
  id: string;
  createdDate: string;
  createdTime: string;
  nomeResponsavel: string;
  nomeEvento: string;
  observacoes: string;
  deviceName: string;
  doorName: string;
  tipo: number;
};

export type EmployeeVisitor = {
  [key: string]: any;
  id: string;
  idVisitante: string;
  idPessoa: string;
  idEntidadeExternas: string;
  dataInicio: Date;
  dataFim: Date;
  dataSaida: Date;
  estado: number;
  idInserido: string;
  obs: string;
  idViatura: string;
  reboque: string;
  dataSaidaFecho: Date;
  refDoc: string;
  visitanteNome: string;
  visitanteNif: string;
  visitanteCartaoEU: string;
  visitantePassaporte: string;
  visitanteContacto: string;
  empresaNome: string;
  empresaNif: string;
  idVisitanteMotivo: string;
  visitanteMotivo: string;
  idPai: string;
  created_at: Date;
  rem: boolean;
  companions: EmployeeVisitorCompanion[];
  companionEmployeeIds: string[];
};

export type EmployeeVisitorCompanion = {
  [key: string]: any;
  id: string;
  employeeVisitanteId: string;
  employeeVisitante: string;
  employeeId: string;
};

export type EmployeeVisitorMotive = {
  [key: string]: any;
  id: string;
  descricao: string;
  created_at: Date;
  rem: boolean;
};

export type ExternalEntity = {
  [key: string]: any;
  id: string;
  name: string;
  comments: string;
  commercialName: string;
  responsibleName: string;
  photo: string;
  address: string;
  zipCode: string;
  locality: string;
  dillage: string;
  district: string;
  phone: number;
  mobile: number;
  email: string;
  www: string;
  fax: number;
  nif: number;
  dateInserted: Date;
  dateUpdated: Date;
  externalEntityTypeId: string;
  externalEntityTypeName: string;
};

export type BuildCenterResponsibles = {
  employeeId: string;
  funcao: string;
  desde: string;
  ate: string;
};

export type BuildCenter = {
  [key: string]: any;
  codigo: string;
  descricao: string;
  cor: string;
  custo: number;
  deviceId: string;
  horaMinut: number;
  dataInicio: Date;
  dataFim: Date;
  morada: string;
  localidade: string;
  codPostal: string;
  gpsLat: number;
  gpsLon: number;
  employeeIds: string[];
  departmentIds: string[];
  groupIds: string[];
  responsaveis: BuildCenterResponsibles[];
};

export type PatrolRegistry = {
  [key: string]: any;
  id: number;
  idPessoa: string;
  movDate: string;
  movHour: string;
  tipoPonto: number;
  idPonto: number;
  endereco: string;
  obs: string;
  idPControl: number;
  idT: string;
  createdAt: Date;
};

export type PatrolPoints = {
  [key: string]: any;
  id: number;
  sigla: string;
  nome: string;
  descricao: string;
  endereco: string;
  tipo: number;
  idZ: string;
  idF: string;
  createdAt: Date;
  inicio: Date;
  fim: Date;
  rem: boolean;
};

export type PatrolDevices = {
  [key: string]: any;
  id: number;
  numero: string;
  nome: string;
  empresa: string;
  modelo: string;
  idFabricante: string;
  serialNumber: string;
  foto: string;
  activo: boolean;
};

export type DoorDeviceAccess = {
  [key: string]: any;
  idPlanosAcessoDispositivo: string;
  idPorta: string;
  nomePorta: string;
};

export type DeviceAccess = {
  [key: string]: any;
  idTerminal: string;
  nomeTerminal: string;
  portas: DoorDeviceAccess[];
};

export type PlanoAcessoDispositivos = {
  [key: string]: any;
  idPlanosAcessoDispositivo: string;
  idPlanoAcesso: string;
  nomePlanoAcesso: string;
  idPlanoHorario: string;
  nomePlanoHorario: string;
  nivel: number;
  createdDate: string;
  rem: boolean;
  dispositivos: DeviceAccess[];
};

export type AccessControl = {
  [key: string]: any;
  id: string;
  nome: string;
  tipo: number;
  tipoVerificacao: number;
  verificacaoFixa: boolean;
  dataInicio: Date;
  dataFim: Date;
  opc: number;
  activo: boolean;
  saldoZonaCarregamento: boolean;
  saldoZonaLotacao: boolean;
  asWithAc: boolean;
  acOutWithAs: boolean;
  acOutWithAsOffset: number;
  masterOnline: boolean;
  respAuthOnline: boolean;
  respAuthOnlineOffset: number;
  acGrpHR: boolean;
  OConfig: string;
  createdDate: Date;
  rem: boolean;
  planosAcessoDispositivos: PlanoAcessoDispositivos[];
  employees: Employee[];
};

export type ServerAccount = {
  [key: string]: any;
  id: string;
  apiKey: string;
  nome: string;
  descricao: string;
  createDate: Date;
  updateDate: Date;
};

export type ServerAccountAttendanceSimple = {
  [key: string]: any;
  numeroEquipamento: number;
  nomeEquipamento: string;
  nomeEmpregado: string;
  numeroEmpregado: string;
  extraFields: { [key: string]: any };
  horaPicagem: string;
  dataPicagem: string;
};

export type KioskTransactionMB = {
  [key: string]: any;
  id: string;
  transactionType: number;
  amount: string;
  statusCode: number;
  statusMessage: string;
  clientTicket: string;
  merchantTicket: string;
  email: string;
  timestamp: Date;
  tpId: string;
  deviceSN: string;
};

export type KioskTransactionCard = {
  [key: string]: any;
  id: string;
  cardNo: number;
  nameUser: string;
  deviceSN: string;
  eventNo: number;
  eventName: string;
  eventDoorId: number;
  eventDoorName: string;
  eventTime: Date;
  pin: number;
};

export type RecolhaMoedeiroEContador = {
  [key: string]: any;
  id: string;
  dataRecolha: Date;
  pessoaResponsavel: string;
  numeroMoedas: number;
  numeroMoedasSistema: number;
  diferencaMoedas: number;
  diferencaEuros: number;
  valorTotalRecolhido: number;
  valorTotalSistema: number;
  observacoes: string;
  deviceID: string;
  serialNumber: string;
  contagemTransacoes: number;
  dataFimRecolha: Date;
};

export type Ads = {
  [key: string]: any;
  id: string;
  NomeArquivo: string;
  TipoArquivo: number;
  Creador: string;
  Desativar: boolean;
  URLArquivo: string;
  Ordem: number;
  tempoExecucaoImagens: number;
  createDate: Date;
  dataFim: Date;
};

export type Cameras = {
  [key: string]: any;
  id: string;
  numeroCamera: number;
  nomeCamera: string;
  ip: string;
  url: string;
  userCamera: string;
  passwordCamera: string;
  createdDate: Date;
  updatedDate: Date;
};

export type Alert = {
  [key: string]: any;
  id: string;
  eventTime: Date;
  eventName: string;
  deviceSN: string;
  deviceName: string;
  name: string;
  estado: boolean;
  inOutStatus: number;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export interface NotificationPreferences {
  typeId: number;
  enabledInApp: boolean;
  enabledPush: boolean;
  typeName?: string;
}

export interface AppNotification {
  [key: string]: any;
  id: string;
  typeId: number;
  typeName: string;
  displayNameKey?: string;
  templateKey?: string;
  payloadJson?: string;
  data?: string;
  entidadeId?: string;
  sourceType?: string;
  sourceId?: string;
  createdAt?: string;
  read?: boolean;
  isRead?: boolean;
  dismissed?: boolean;
}

export interface NotificationsListResponse {
  [key: string]: any;
  data?: AppNotification[];
  items?: AppNotification[];
  totalRecords?: number;
  totalCount?: number;
  total?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface UserAuthorizationResponse {
  user: UserSummary;
  roles: string[];
  permissions: string[];
  flags: AuthorizationFlags;
}

export interface UserSummary {
  id: string;
  userName: string;
  name: string;
  email: string;
  employeeId?: string | null;
}

export interface AuthorizationFlags {
  isSuperAdmin: boolean;
  canManageRoles: boolean;
  canAssignSystemRoles: boolean;
  hasEmployeeLink: boolean;
}

export interface RoleMetadata {
  roleId: string;
  roleName: string;
  assignableInUi: boolean;
  editableInUi: boolean;
  deletableInUi: boolean;
  isSystem: boolean;
}