import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppModal } from "../components/AppModal";
import { Button } from "../components/Button";
import { SignaturePad, type SignaturePadHandle } from "../components/SignaturePad";
import { toast } from "../utils/toast";
import { colors } from "../theme";

type Props<T> = {
  open: boolean;
  onClose: () => void;
  onSave: (entity: T) => void;
  entity: Partial<T> | null;
  message?: string;
};

export const CreateModalSignatureAttendance = <T,>({ open, onClose, onSave, entity, message }: Props<T>) => {
  const { t } = useTranslation("modals");
  const padRef = useRef<SignaturePadHandle>(null);
  const [wantsSignature, setWantsSignature] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const handleClose = () => {
    setWantsSignature(false);
    onClose();
  };

  const handleNo = () => {
    onSave(entity as T);
    handleClose();
  };

  const handleYes = async () => {
    if (!wantsSignature) {
      setWantsSignature(true);
      return;
    }

    const signatureBase64 = await padRef.current?.read();
    if (!signatureBase64) {
      toast.warn(t("signatureRequired"), { toastId: "signature-required" });
      return;
    }

    onSave({ ...(entity as T), signatureBase64 });
    handleClose();
  };

  return (
    <AppModal
      open={open}
      title={t("askSignature")}
      onClose={handleClose}
      scrollEnabled={!drawing}
      footer={
        <>
          <Button title={t("nao")} onPress={handleNo} />
          <Button title={t("sim")} onPress={handleYes} />
        </>
      }
    >
      <Text style={styles.message}>{message ?? t("askSignatureMessage")}</Text>
      {wantsSignature ? (
        <View style={styles.padArea}>
          <SignaturePad ref={padRef} height={200} onBegin={() => setDrawing(true)} onEnd={() => setDrawing(false)} />
          <Button title={t("clearSignature")} onPress={() => padRef.current?.clear()} style={styles.clear} />
        </View>
      ) : null}
    </AppModal>
  );
};

const styles = StyleSheet.create({
  message: { fontSize: 15, color: colors.dark },
  padArea: { marginTop: 12, gap: 8 },
  clear: { alignSelf: "flex-start" },
});
