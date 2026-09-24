import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppModal } from "../components/AppModal";
import { Button } from "../components/Button";
import { SelectField } from "../components/SelectField";
import { DateTimeField } from "../components/DateTimeField";
import { toast } from "../utils/toast";
import { toLocalDateTimeString } from "../utils/dateUtils";
import type { Accesses, Devices, Doors, Employee } from "../types/Types";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Accesses>) => void;
  employees?: string[];
  terminals: Devices[];
  doors: Doors[];
  disabledEmployees: Employee[];
};

export const CreateModalAccess = (props: Props) => (props.open ? <AccessForm {...props} /> : null);

const AccessForm = ({ title, onClose, onSave, employees, terminals, doors, disabledEmployees }: Props) => {
  const { t } = useTranslation("modals");
  const [eventTime, setEventTime] = useState<Date | null>(() => new Date());
  const [deviceSN, setDeviceSN] = useState<string | undefined>();
  const [eventDoorId, setEventDoorId] = useState<number | undefined>();
  const [inOutStatus, setInOutStatus] = useState<number>(0);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const terminalOptions = useMemo(
    () =>
      [...terminals]
        .sort((a, b) => a.deviceNumber - b.deviceNumber)
        .map((d) => ({ value: String(d.serialNumber), label: d.deviceName })),
    [terminals],
  );

  const doorOptions = useMemo(
    () =>
      doors
        .filter((d) => d.devSN === deviceSN)
        .sort((a, b) => a.doorNo - b.doorNo)
        .map((d) => ({ value: Number(d.doorNo), label: d.name })),
    [doors, deviceSN],
  );

  const handleSave = () => {
    if (!eventTime || !deviceSN || !eventDoorId) {
      setShowValidationErrors(true);
      toast.warn(t("requiredAllFields"));
      return;
    }

    const cardNumbers = (employees ?? [])
      .map((enroll) => disabledEmployees.find((e: any) => String(e.enrollNumber) === String(enroll)))
      .map((e: any) => e?.employeeCards?.[0]?.cardNumber ?? null)
      .filter(Boolean);

    onSave({
      eventTime: toLocalDateTimeString(eventTime),
      deviceSN,
      eventDoorId,
      inOutStatus,
      pin: Number(employees?.[0]) || "",
      cardNo: cardNumbers[0] || "",
    } as unknown as Partial<Accesses>);
    onClose();
  };

  return (
    <AppModal
      open
      title={t(title)}
      onClose={onClose}
      footer={
        <>
          <Button title={t("close")} onPress={onClose} />
          <Button title={t("save")} onPress={handleSave} />
        </>
      }
    >
      <DateTimeField label={t("dateLabel")} mode="datetime" value={eventTime} onChange={setEventTime} />
      <SelectField
        label={t("Equipmento")}
        required
        error={showValidationErrors && !deviceSN}
        value={deviceSN}
        options={terminalOptions}
        onChange={(v) => {
          setDeviceSN(v);
          setEventDoorId(undefined);
        }}
      />
      <SelectField
        label={t("door")}
        required
        error={showValidationErrors && !eventDoorId}
        value={eventDoorId}
        options={doorOptions}
        onChange={setEventDoorId}
      />
      <SelectField
        label={t("type")}
        value={inOutStatus}
        allowEmpty={false}
        options={[
          { value: 0, label: t("entry") },
          { value: 1, label: t("exit") },
        ]}
        onChange={(v) => setInOutStatus(v ?? 0)}
      />
    </AppModal>
  );
};
