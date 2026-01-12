"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

export default function Page() {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi({ "namespace": "30min" });
            cal("ui", { "theme": "light", "cssVarsPerTheme": { "light": { "cal-brand": "#F6339A" }, "dark": { "cal-brand": "#F6339A" } }, "hideEventTypeDetails": false, "layout": "month_view" });
        })();
    }, [])

    return <Cal namespace="30min"
        calLink="kunal-jadhav-rua8r0/30min"
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{ "layout": "month_view", "theme": "light" }}


    />;
};


