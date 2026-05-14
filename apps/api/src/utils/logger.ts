import { createConsola } from "consola";
import chalk from "chalk";

export const logger = createConsola({
  level: 4,
});

const brand = chalk.hex("#6366f1");
const green = chalk.hex("#22c55e");
const amber = chalk.hex("#f59e0b");
const red = chalk.hex("#ef4444");
const blue = chalk.hex("#3b82f6");
const purple = chalk.hex("#a855f7");
const gray = chalk.hex("#6b7280");
const dim = chalk.dim;

const label = {
  env: gray("env"),
  url: gray("url"),
  docs: gray("docs"),
  ref: gray("ref"),
  db: gray("db"),
  auth: gray("auth"),
  routes: gray("routes"),
};

export type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
};

export type EndpointGroup = {
  tag: string;
  color: string;
  routes: Endpoint[];
};

function methodTag(method: string): string {
  switch (method) {
    case "GET":    return green(method);
    case "POST":   return blue(method);
    case "PATCH":  return amber(method);
    case "DELETE": return red(method);
    default:       return chalk.bold(method);
  }
}

export function printStartupBanner(info: {
  port: number;
  host: string;
  env: string;
  version: string;
}) {
  const serverUrl = `http://${info.host}:${info.port}`;

  console.log();
  console.log(
    `  ${brand.bold("▌")} ${brand.bold("NexusFlow API")} ${gray(`v${info.version}`)}`,
  );
  console.log(`  ${dim("─").repeat(44)}`);
  console.log(`  ${label.env}     ${chalk.cyan(info.env)}${gray("  ● running")}`);
  console.log(`  ${label.url}     ${green(serverUrl)}`);
  console.log(`  ${label.ref}     ${blue(`${serverUrl}/reference`)}  ${gray("— Scalar API Reference")}`);
  console.log(`  ${label.db}      ${green("●")} ${green("connected")}  ${gray("— PostgreSQL 17")}`);
  console.log(`  ${label.auth}    ${green("●")} ${green("JWT ready")}`);
  console.log(`  ${dim("─").repeat(44)}`);
  console.log();
}

export function printEndpointList(groups: EndpointGroup[]) {
  for (const group of groups) {
    const tagColor = chalk.hex(group.color);
    console.log(`  ${tagColor.bold("──")} ${tagColor.bold(group.tag)}`);
    for (const route of group.routes) {
      const m = methodTag(route.method).padEnd(6);
      console.log(`    ${m} ${gray(route.path)}`);
    }
    console.log();
  }
}

export function logServerStart(port: number, host: string) {
  logger.ready(`Server listening on ${chalk.green(`http://${host}:${port}`)}`);
}

export type StatusCode = number;

export function logIncomingRequest(method: string, url: string) {
  logger.log(`${dim("→")} ${methodStr(method)} ${gray(url)}`);
}

export function logResponse(
  method: string,
  url: string,
  statusCode: StatusCode,
  responseTime: number,
) {
  const methodPadded = methodStr(method).padEnd(6);
  const urlStr = dim(url);
  const statusStr = statusColor(statusCode);
  const timeStr = dim(`${Math.round(responseTime)}ms`);

  logger.log(` ${dim("›")} ${methodPadded} ${urlStr}  ${statusStr}  ${timeStr}`);
}

export function logAuthEvent(event: string, email?: string) {
  const tag = chalk.hex("#a855f7")("auth");
  const msg = email ? `${event}  ${gray(email)}` : event;
  logger.log(`  ${tag} ${msg}`);
}

export function logDbStatus(status: "connecting" | "connected" | "error", detail?: string) {
  const dot = status === "connected" ? green("●") : status === "error" ? red("●") : amber("●");
  const label = chalk.hex("#22c55e")("db");
  logger.log(`  ${label} ${dot} ${status}${detail ? ` ${gray(detail)}` : ""}`);
}

function methodStr(method: string): string {
  const m = method.toUpperCase();
  switch (m) {
    case "GET":    return green(m);
    case "POST":   return blue(m);
    case "PATCH":  return amber(m);
    case "PUT":    return chalk.hex("#f97316")(m);
    case "DELETE": return red(m);
    default:       return chalk.bold(m);
  }
}

function statusColor(code: StatusCode): string {
  if (code >= 200 && code < 300) return green(String(code));
  if (code >= 300 && code < 400) return amber(String(code));
  if (code >= 400 && code < 500) return chalk.hex("#f97316")(String(code));
  return red(String(code));
}
