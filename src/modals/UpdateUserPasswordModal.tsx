import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppModal } from "../components/AppModal";
import { PasswordField } from "../components/Form";
import { Button } from "../components/Button";
import { toast } from "../utils/toast";
import type { Register } from "../types/Types";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  onUpdate: (entity: FormData) => Promise<void>;
  entity: Register | null;
};

const validatePassword = (password: string): boolean =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*\-_])(?=.{6,})/.test(password);

export const UpdateUserPasswordModal = (props: Props) => (props.open ? <UpdateUserPasswordForm {...props} /> : null);

const UpdateUserPasswordForm = ({ title, onClose, onUpdate, entity }: Props) => {
  const { t } = useTranslation("modals");
  const [password, setPassword] = useState("");
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!entity) return;
    if (!password || !validatePassword(password)) {
      setShowValidationErrors(true);
      toast.warn(t("InvalidPassword"));
      return;
    }

    const data = new FormData();
    const e = entity as Register & Record<string, any>;
    if (e.id) data.append("id", String(e.id));
    if (e.name) data.append("Name", String(e.name));
    if (e.userName) data.append("UserName", String(e.userName));
    if (e.emailAddress) data.append("EmailAddress", String(e.emailAddress));
    if (e.roles) data.append("Role", String(e.roles));
    data.append("Password", password);

    setSaving(true);
    try {
      await onUpdate(data);
      onClose();
    } catch {
      console.error("Failed to update user password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal
      open
      title={t(title)}
      onClose={onClose}
      footer={
        <>
          <Button title={t("close")} onPress={onClose} />
          <Button title={t("save")} onPress={handleSave} loading={saving} disabled={!entity} />
        </>
      }
    >
      <PasswordField
        label={t("ChangePassword")}
        value={password}
        onChangeText={(v) => {
          setShowValidationErrors(false);
          setPassword(v.replace(/\s+/g, ""));
        }}
        error={showValidationErrors}
      />
    </AppModal>
  );
};
