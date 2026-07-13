import { z } from 'zod';
import { telemetryProgressSchema } from '../schemas/telemetry.schema.js';

export type TelemetryProgressInput = z.infer<typeof telemetryProgressSchema>;
