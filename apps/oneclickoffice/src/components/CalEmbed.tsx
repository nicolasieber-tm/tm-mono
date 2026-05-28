import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

const CalEmbed = () => {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "oneclick-office" });
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      id="my-cal-inline-oneclick-office"
    >
      <Cal
        namespace="oneclick-office"
        calLink="nicolasieber/oneclick-office"
        style={{ width: "100%", height: "100%", minHeight: "680px" }}
        config={{
          layout: "month_view",
          useSlotsViewOnSmallScreen: "true",
          theme: "light",
        }}
      />
    </div>
  );
};

export default CalEmbed;
