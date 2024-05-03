const { visit } = require("unist-util-visit");
const path = require("node:path");
const yaml = require("js-yaml");

const runmePlugin = ({ repository }) => {
  if (!repository) {
    throw new Error("repository is required");
  }

  const transformer = async (ast, vfile) => {
    const markdownPath = vfile.path.replace(`${vfile.cwd}${path.sep}`, "");
    let isRunmeFile = false;

    visit(ast, "yaml", (node, index, parent) => {
      const yml = yaml.load(node.value);
      if (yml?.runme) {
        isRunmeFile = true;
      }
    });

    if (!isRunmeFile) {
      return;
    }

    // let inserted = false;
    visit(ast, "heading", (node, index, parent) => {
      // inserted = true;
      parent.children.splice(index, 0, {
        type: "link",
        url: `https://runme.dev/api/runme?repository=${encodeURIComponent(
          repository
        )}&fileToOpen=${markdownPath}`,
        title: "Open with runme",
        children: [
          {
            type: "image",
            title: "Open with runme",
            url: "https://badgen.net/badge/Open%20with/Runme/5B3ADF?icon=https://runme.dev/img/logo.svg",
            alt: "Runme badget",
          },
        ],
      });
      return false;
    });
  };

  return transformer;
};

module.exports = runmePlugin;
