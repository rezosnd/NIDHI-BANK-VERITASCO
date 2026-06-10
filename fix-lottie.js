import fs from "fs";
import path from "path";

function walk(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (
                file !== "node_modules" &&
                file !== ".git" &&
                file !== "dist"
            ) {
                walk(fullPath);
            }
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
            let content = fs.readFileSync(fullPath, "utf8");
            const original = content;

            content = content.replaceAll(
                'import { DotLottiePlayer } from "@dotlottie/react-player";',
                'import { DotLottieReact } from "@lottiefiles/dotlottie-react";'
            );

            content = content.replaceAll(
                "DotLottiePlayer",
                "DotLottieReact"
            );

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log("Fixed:", fullPath);
            }
        }
    }
}

walk("./src");
console.log("Done!");