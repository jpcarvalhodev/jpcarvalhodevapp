import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppModal } from "../components/AppModal";
import { Button } from "../components/Button";
import { TextField } from "../components/Form";
import { DateTimeField } from "../components/DateTimeField";
import { toast } from "../utils/toast";
import { toLocalDateTimeString } from "../utils/dateUtils";

type Props<T> = {
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: T) => void;
  data: Partial<T>;
};

export const CreateModalAttendanceRequests = <T extends Record<string, any>>(
  props: Props<T>,
) => (props.open ? <RequestForm {...props} /> : null);

const RequestForm = <T extends Record<string, any>>({
  title,
  onClose,
  onSave,
  data,
}: Props<T>) => {
  const { t } = useTranslation("modals");
  const [attendanceTime, setAttendanceTime] = useState<Date | null>(() =>
    data?.attendanceTime ? new Date(data.attendanceTime) : new Date(),
  );
  const [observation, setObservation] = useState("");

  const handleSave = () => {
    if (!attendanceTime || !observation.trim()) {
      toast.warn(t("requiredAllFields"));
      return;
    }

    onSave({
      ...data,
      attendanceTime: toLocalDateTimeString(attendanceTime),
      observation,
      type: 3,
    } as unknown as T);
    onClose();
  };

  return (
    <AppModal
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button title={t("close")} onPress={onClose} />
          <Button title={t("save")} onPress={handleSave} />
        </>
      }
    >
      <DateTimeField
        label={t("dateLabel")}
        required
        mode="datetime"
        value={attendanceTime}
        onChange={setAttendanceTime}
      />
      <TextField
        label={t("observationLabel")}
        required
        multiline
        numberOfLines={6}
        value={observation}
        onChangeText={setObservation}
      />
    </AppModal>
  );
};
