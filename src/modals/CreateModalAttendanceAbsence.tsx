import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppModal } from "../components/AppModal";
import { Button } from "../components/Button";
import { RadioGroup, Section, SwitchRow, TextField } from "../components/Form";
import { SelectField } from "../components/SelectField";
import { DateTimeField } from "../components/DateTimeField";
import { DateRangeSelector } from "../components/DateRangeSelector";
import type { DateRange } from "../components/MonthCalendar";
import { startOfDay } from "../utils/calendar";
import { toast } from "../utils/toast";
import type { AttendanceAbsences, AttendanceCodes } from "../types/Types";
import { dateToHHmm, dayEndIso, dayStartIso, hhmmToDate, isHHmm, validationOptions } from "./formHelpers";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<AttendanceAbsences>) => void;
  data: Partial<AttendanceAbsences> | null;
  devpatrol: boolean;
  attendanceCodes: AttendanceCodes[];
};

type FormState = {
  idCod?: number;
  tipo?: number;
  diaProcessa: number;
  dataInicio?: string;
  dataFim?: string;
  valor?: string;
  pagar: boolean;
  obs: string;
  validado: number;
  respValidado: number;
};

const initialForm = (): FormState => ({ diaProcessa: 1, pagar: false, obs: "", validado: 2, respValidado: 2 });

export const CreateModalAttendanceAbsenceModal = (props: Props) => (props.open ? <AbsenceForm {...props} /> : null);

const AbsenceForm = ({ title, onClose, onSave, data, devpatrol, attendanceCodes }: Props) => {
  const { t } = useTranslation("modals");
  const [form, setForm] = useState<FormState>(initialForm);
  const [range, setRange] = useState<DateRange>(() => ({ start: startOfDay(new Date()), end: startOfDay(new Date()) }));
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!devpatrol && !form.idCod) {
      setShowValidationErrors(true);
      toast.warn(t("fillRequiredFields"));
      return;
    }

    const { dataInicio, dataFim, ...rest } = form;
    const baseAusencia: Record<string, unknown> = {
      ...(data ?? {}),
      ...rest,
      tipo: Number(form.tipo),
    };
    delete baseAusencia.idPessoa;
    if (form.tipo === 2 && dataInicio && isHHmm(dataInicio)) baseAusencia.dataInicio = dataInicio;
    if (form.tipo === 2 && dataFim && isHHmm(dataFim)) baseAusencia.dataFim = dataFim;

    onSave({
      baseAusencia,
      idPessoas: [data?.idPessoa ?? ""],
      dataInicio: dayStartIso(range.start),
      dataFim: dayEndIso(range.end),
    } as unknown as Partial<AttendanceAbsences>);
    onClose();
  };

  const typeOptions = [
    { value: 1, label: t("allDay") },
    { value: 2, label: t("timeInterval") },
    { value: 3, label: t("halfDay") },
    { value: 4, label: t("duration") },
  ];

  const dayOptions = [
    { value: 0, label: t("previousDay") },
    { value: 1, label: t("processingDay") },
    { value: 2, label: t("nextDay") },
  ];

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
        <SelectField
          label={t("absenceDuration")}
          value={form.tipo}
          options={typeOptions}
          onChange={(v) => update("tipo", v)}
        />
        {form.tipo === 2 ? (
          <>
            <SelectField
              label={t("processingDay")}
              value={form.diaProcessa}
              allowEmpty={false}
              options={dayOptions}
              onChange={(v) => update("diaProcessa", v ?? 1)}
            />
            <DateTimeField
              label={t("start")}
              mode="time"
              value={hhmmToDate(form.dataInicio)}
              onChange={(d) => update("dataInicio", dateToHHmm(d))}
            />
            <DateTimeField
              label={t("end")}
              mode="time"
              value={hhmmToDate(form.dataFim)}
              onChange={(d) => update("dataFim", dateToHHmm(d))}
            />
          </>
        ) : null}
        {form.tipo === 4 ? (
          <DateTimeField
            label={t("value")}
            mode="time"
            value={hhmmToDate(form.valor)}
            onChange={(d) => update("valor", dateToHHmm(d))}
          />
        ) : null}
        <SwitchRow label={`${t("authorizePayment")}:`} value={form.pagar} onChange={(v) => update("pagar", v)} />
        <TextField label={t("justificationLabel")} value={form.obs} onChangeText={(v) => update("obs", v)} />
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
