import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppModal } from "../components/AppModal";
import { Button } from "../components/Button";
import { TextField } from "../components/Form";
import { SelectField } from "../components/SelectField";
import { getSessionValue } from "../hooks/useSession";
import { toast } from "../utils/toast";
import type { Devices, Doors, ManualOpenDoor } from "../types/Types";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: ManualOpenDoor) => void;
  terminals: Devices[];
  doors: Doors[];
};

export const ManualOpenDoorModal = (props: Props) => (props.open ? <OpenDoorForm {...props} /> : null);

const OpenDoorForm = ({ title, onClose, onSave, terminals, doors }: Props) => {
  const { t } = useTranslation("modals");
  const [deviceId, setDeviceId] = useState<string | undefined>();
  const [doorId, setDoorId] = useState<string | undefined>();
  const [observacoes, setObservacoes] = useState("");
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const terminalOptions = useMemo(
    () =>
      [...terminals]
        .sort((a, b) => a.deviceNumber - b.deviceNumber)
        .map((d) => ({ value: String(d.zktecoDeviceID), label: d.deviceName })),
    [terminals],
  );

  const doorOptions = useMemo(
    () =>
      doors
        .filter((d) => String(d.devId) === deviceId)
        .sort((a, b) => a.doorNo - b.doorNo)
        .map((d) => ({ value: String(d.id), label: d.name })),
    [doors, deviceId],
  );

  const handleSave = () => {
    if (!deviceId || !doorId || !observacoes.trim()) {
      setShowValidationErrors(true);
      toast.warn(t("requiredAllFields"));
      return;
    }

    onSave({
      deviceId,
      doorId,
      observacoes,
      nomeResponsavel: getSessionValue("username") ?? "",
    } as unknown as ManualOpenDoor);
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
          <Button title={t("open")} onPress={handleSave} />
        </>
      }
    >
      <SelectField
        label={t("Equipmento")}
        required
        error={showValidationErrors && !deviceId}
        value={deviceId}
        options={terminalOptions}
        onChange={(v) => {
          setDeviceId(v);
          setDoorId(undefined);
        }}
      />
      <SelectField
        label={t("door")}
        required
        error={showValidationErrors && !doorId}
        value={doorId}
        options={doorOptions}
        onChange={setDoorId}
      />
      <TextField
        label={t("observationLabel")}
        required
        error={showValidationErrors && !observacoes.trim()}
        value={observacoes}
        onChangeText={setObservacoes}
      />
    </AppModal>
  );
};
