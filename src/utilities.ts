export function getRelativeTime(value: string, formattedValue: string): string {
  const now = new Date();
  const date = new Date(value);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (seconds < 3600) {
    if (seconds < 60) {
      return rtf.format(-seconds, "second").replace(/ seconds?/, "s");
    } else {
      return rtf
        .format(-Math.floor(seconds / 60), "minute")
        .replace(/ minutes?/, "m");
    }
  } else if (seconds < 86400) {
    return rtf
      .format(-Math.floor(seconds / 3600), "hour")
      .replace(/ hours?/, "h");
  } else {
    const normalDate = formattedValue.includes("AM")
      ? formattedValue.split("AM ")[1]
      : formattedValue.split("PM ")[1];
    return normalDate;
  }
}
