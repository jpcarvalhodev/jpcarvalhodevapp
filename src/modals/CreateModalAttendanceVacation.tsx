import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppModal } from "../components/AppModal";
import { Button } from "../components/Button";
import { RadioGroup, Section, TextField } from "../components/Form";
import { SelectField } from "../components/SelectField";
import { DateRangeSelector } from "../components/DateRangeSelector";
import type { DateRange } from "../components/MonthCalendar";
import { startOfDay } from "../utils/calendar";
import { toast } from "../utils/toast";
import type { AttendanceCodes, AttendanceVacation, Employee } from "../types/Types";
import { dayEndIso, dayStartIso, validationOptions } from "./formHelpers";
import { colors } from "../theme";

export type VacationModalData = {
  idPessoa: string;
  enrollNumbers?: string[];
  empData?: Partial<Employee>;
};

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<AttendanceVacation>) => void;
  data: VacationModalData | null;
  devpatrol: boolean;
  attendanceCodes: AttendanceCodes[];
};

type FormState = {
  idCod?: number;
  tipo?: number;
  ano?: number;
  obs: string;
  validado: number;
  respValidado: number;
};

const initialForm = (): FormState => ({ obs: "", validado: 2, respValidado: 2 });

export const CreateModalAttendanceVacationModal = (props: Props) => (props.open ? <VacationForm {...props} /> : null);

const VacationForm = ({ title, onClose, onSave, data, devpatrol, attendanceCodes }: Props) => {
  const { t } = useTranslation("modals");
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState<FormState>(initialForm);
  const [range, setRange] = useState<DateRange>(() => ({ start: startOfDay(new Date()), end: startOfDay(new Date()) }));
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const summary = (data?.empData as any)?.anos?.[0];

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.idCod) {
      setShowValidationErrors(true);
      toast.warn(t("fillRequiredFields"));
      return;
    }

    const pedidos = [
      {
        idPessoa: data?.idPessoa ?? "",
        ...form,
        enrollNumbers: Array.isArray(data?.enrollNumbers) ? data.enrollNumbers : [],
        dataInicio: dayStartIso(range.start),
        dataFim: dayEndIso(range.end),
      },
    ];

    onSave({ pedidos } as unknown as Partial<AttendanceVacation>);
    onClose();
  };

  const typeOptions = [
    { value: 1, label: t("todoDia") },
    { value: 2, label: t("meioDia") },
  ];

  const yearOptions = [currentYear, currentYear + 1, currentYear + 2].map((y) => ({ value: y, label: String(y) }));

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
      <Section title={t("dateRange")}>
        <DateRangeSelector value={range} onChange={setRange} />
      </Section>
      <Section title={t("general")}>
        {!devpatrol ? (
          <SelectField
            label={t("code")}
            required
            error={showValidationErrors && !form.idCod}
            value={form.idCod}
            options={attendanceCodes
              .filter((c) => c.tipo === 1)
              .map((c) => ({ value: Number(c.id), label: c.descricao ?? String(c.id) }))}
            onChange={(v) => update("idCod", v)}
          />
        ) : null}
        <SelectField label={t("absenceDuration")} value={form.tipo} options={typeOptions} onChange={(v) => update("tipo", v)} />
        <SelectField label={t("relativoAoAno")} value={form.ano} options={yearOptions} onChange={(v) => update("ano", v)} />
        <TextField label={t("justificationLabel")} value={form.obs} onChangeText={(v) => update("obs", v)} />
      </Section>
      <Section title={t("informacao")}>
        <InfoRow label={t("totalAGozar")} value={summary?.totalDiasGlobal} />
        <InfoRow label={t("relativoEsteAno")} value={summary?.ano} />
        <InfoRow label={t("nesteAno")} value={summary ? (summary.temPlafond ? t("sim") : t("nao")) : undefined} />
        <InfoRow label={t("saldo")} value={summary?.diasPorGozar} />
        <InfoRow label={t("gozados")} value={summary?.diasGozados} />
      </Section>
      <Section title={t("finalAuthorization")}>
        <RadioGroup value={form.validado} options={validationOptions(t)} onChange={(v) => update("validado", v)} />
      </Section>
      <Section title={t("responsibleAuthorization")}>
        <RadioGroup
          value={form.respValidado}
          options={validationOptions(t)}
          onChange={(v) => update("respValidado", v)}
        />
      </Section>
    </AppModal>
  );
};

const InfoRow = ({ label, value }: { label: string; value: unknown }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value == null || value === "" ? "-" : String(value)}</Text>
  </View>
);

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoLabel: { color: colors.muted, flexShrink: 1 },
  infoValue: { color: colors.navy, fontWeight: "600" },
});
