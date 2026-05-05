import { serve } from "inngest/next";
import { inngest } from "../inngest/client.js";
import { generatePresente } from "../inngest/functions/generatePresente.js";

export default serve({
    client: inngest,
    functions: [generatePresente],
});
