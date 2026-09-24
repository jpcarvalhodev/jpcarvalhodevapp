import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import {
  useAddManualOpenDoorMutation,
  useDoorsQuery,
  useManualOpenDoorQuery,
  useTerminalsQuery,
} from "../../../query/terminalQuery";
import { useAttendanceFilters } from "../../../store/dataStore";
import { useAuthUser } from "../../../store/authStore";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { RequirePermissions } from "../../../components/RequirePermissions";
import { ActionCard, Block, EmptyRow, Row3 } from "../../../components/Cards";
import { ManualOpenDoorModal } from "../../../modals/ManualOpenDoorModal";
import { formatDate } from "../../../utils/dateUtils";
import { truncate } from "../../../utils/text";
import { EMPTY_ARRAY } from "../../../utils/emptyArray";

function DevaccessDoor() {
  const { t } = useTranslation("pages");
  const { width, height } = useWindowDimensions();
  const descriptionLimit = width > height ? 20 : 11;
  const { startDate, endDate } = useAttendanceFilters();
  const { permissions, flags } = useAuthUser();
  const canOpenDoor = flags.isSuperAdmin || permissions.includes("Naccess.OpenDoor");
  const [openModal, setOpenModal] = useState(false);

  const {
    data: openings = EMPTY_ARRAY,
    refetch,
    isRefetching,
  } = useManualOpenDoorQuery(startDate, endDate, undefined, undefined, "1", "10");
  const { data: terminals = EMPTY_ARRAY } = useTerminalsQuery();
  const { data: doors = EMPTY_ARRAY } = useDoorsQuery();
  const openDoorMutation = useAddManualOpenDoorMutation();

  return (
    <ScreenLayout onRefresh={() => void refetch()} refreshing={isRefetching}>
      <ActionCard icon="key-outline" label={t("open_door")} onPress={() => setOpenModal(true)} disabled={!canOpenDoor} />
      <Block title={t("recent_opens")}>
        {openings.length === 0 ? (
          <EmptyRow text={t("no_activity")} />
        ) : (
          openings.map((a, i) => (
            <Row3
              key={a.id || String(i)}
              cols={[formatDate(a.createdDate?.slice(0, 10)), a.createdTime, truncate(a.nomeEvento, descriptionLimit)]}
            />
          ))
        )}
      </Block>
      <ManualOpenDoorModal
        title={t("open_door")}
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={(payload) => void openDoorMutation.mutateAsync(payload)}
        terminals={terminals}
        doors={doors}
      />
    </ScreenLayout>
  );
}

export default function DevaccessDoorScreen() {
  return (
    <RequirePermissions permissions={["Naccess.View", "Naccess.OpenDoor"]}>
      <DevaccessDoor />
    </RequirePermissions>
  );
}
