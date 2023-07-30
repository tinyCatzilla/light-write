import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { createEditor, Editor, Text, Descendant, Transforms, Node } from 'slate';
import { ReactEditor, Slate, Editable, withReact, RenderLeafProps, RenderElementProps, useSlate } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import { latexMathToHtml } from './mathToHTML';
import Select from 'react-select';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.css';
// import 'prismjs/themes/prism-tomorrow.css'; dark theme

import Split from 'react-split'
// import html2canvas from "html2canvas";
import './style.css';
import './themes/light.css';


declare global {
  interface Window {
    electron: any;
    api: {
      capturePage: () => Promise<Buffer>;
      captureRect: (rect: { x: number; y: number; width: number; height: number }) => Promise<Buffer>;
    }
  }
}

type CustomElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomText = {
  text: string;
  code?: boolean;
  font?: string;
  size?: string;
  color?: string;
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  glow?: string;
};

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: CustomElement[] = [
  {
    type: 'paragraph',
    children: [{ text: String.raw`I love LaTeX!! $\int_0^1 \Gamma^{(\alpha-1)}(x)$`, font: 'Georiga', size: '16px', color: '#000000', bold: false, italics: false, underline: false}],
  },
];

const DefaultElement = (props: RenderElementProps) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

const FontFamilyDropdown = () => {
  const editor = useSlate();
  const [font, setFont] = useState(fontOptions[3]);

  const handleChange = (selectedOption: any) => {
    setFont(selectedOption);
    if (editor.selection) {
      Editor.addMark(editor, 'font', selectedOption.value);
    }
  };

  useEffect(() => {
    if (editor.selection) {
      const marks = Editor.marks(editor);
      if (marks && marks.font) {
        setFont(fontOptions.find((option) => option.value === marks.font) || fontOptions[3]);
      }
    }
  }, [editor.selection]);

  const customStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      color: 'black'
    }),
    control: (provided: any, state: any) => ({
      ...provided,
      color: 'black'
    }),
    singleValue: (provided: any, state: any) => ({
      ...provided,
      color: 'black'
    })
  }

  return (
    <Select 
      options={fontOptions} 
      value={font} 
      onChange={handleChange} 
      isSearchable={false} 
      hideSelectedOptions={false}
      // style
      className="toolbarDropdown"
      styles={customStyles}
    />
  );
};

const sizeOptions = [
  { value: '12px', label: '12' },
  { value: '16px', label: '16' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
  { value: '28px', label: '28' },
];

const FontSizeDropdown = () => {
  const editor = useSlate();
  const [size, setSize] = useState(sizeOptions[1]);

  const handleChange = (selectedOption: any) => {
    setSize(selectedOption);
    if (editor.selection) {
      Editor.addMark(editor, 'size', selectedOption.value);
    }
  };

  useEffect(() => {
    if (editor.selection) {
      const marks = Editor.marks(editor);
      if (marks && marks.size) {
        setSize(sizeOptions.find((option) => option.value === marks.size) || sizeOptions[1]);
      }
    }
  }, [editor.selection]);

  const customStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      color: 'black'
    }),
    control: (provided: any, state: any) => ({
      ...provided,
      color: 'black'
    }),
    singleValue: (provided: any, state: any) => ({
      ...provided,
      color: 'black'
    })
  }

  return (
    <Select 
      options={sizeOptions} 
      value={size} 
      onChange={handleChange} 
      isSearchable={false} 
      hideSelectedOptions={false}
      // style
      className="toolbarDropdown"
      styles={customStyles}
    />
  );
};
const TextColorButton = () => {
  const editor = useSlate();
  const [color, setColor] = useState('#000000');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setColor(newColor);

    if (editor.selection) {
      Editor.addMark(editor, 'color', newColor);
      // Editor.addMark(editor, 'textShadow', `0 0 0.2em ${newColor}`);
    }
  };

  useEffect(() => {
    if (editor.selection) {
      const marks = Editor.marks(editor);
      if (marks && marks.color) {
        setColor(marks.color);
      }
    }
  }, [editor.selection]);

  return <input type="color" value={color} onChange={handleChange} />;
};


const BoldButton = () => {
  const editor = useSlate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const marks = Editor.marks(editor);
    const isBold = marks ? marks.bold === true : false;
    Editor.addMark(editor, 'bold', !isBold);
  };

  return <button className="toolbarBtn" onMouseDown={handleClick}><i className="fa-solid fa-bold"></i>
  </button>;
};

const ItalicsButton = () => {
  const editor = useSlate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const marks = Editor.marks(editor);
    const isItalics = marks ? marks.italics === true : false;
    Editor.addMark(editor, 'italics', !isItalics);
  };

  return <button className="toolbarBtn" onMouseDown={handleClick}><i className="fa-solid fa-italic"></i>
  </button>;
};


const UnderlineButton = () => {
  const editor = useSlate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const marks = Editor.marks(editor);
    const isUnderline = marks ? marks.underline === true : false;
    Editor.addMark(editor, 'underline', !isUnderline);
  };

  return <button className="toolbarBtn" onMouseDown={handleClick}><i className="fa-solid fa-underline"></i></button>;
};

const InlineCodeButton = () => {
  const editor = useSlate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    wrapCodeBlock(editor);
  };

  return <button className="toolbarBtn" onMouseDown={handleClick}><i className="fa-solid fa-code"></i></button>;
};

// Wrap selected text in `code`
function wrapCodeBlock(editor: any) {
  if (editor.selection) {
    const selectedText = Editor.string(editor, editor.selection);
  
    // Add ``` at start and end of the selection
    const textWithCodeBlock = `\`\`\`${selectedText}\`\`\``;
  
    // Replace selected text with new text wrapped in ```
    Transforms.insertText(editor, textWithCodeBlock);
  }
}

const UndoButton = () => {
  const editor = useSlate() as unknown as HistoryEditor;

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    editor.undo();
  };

  return <button className="toolbarBtn" onMouseDown={handleClick}><i className="fa-solid fa-undo"></i></button>;
};

const RedoButton = () => {
  const editor = useSlate() as unknown as HistoryEditor;

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    editor.redo();
  };

  return <button className="toolbarBtn" onMouseDown={handleClick}><i className="fa-solid fa-redo"></i></button>;
};

const handleCaptureClick = async () => {
  // Find the div and its bounding rectangle
  const div = document.querySelector('.preview-container');
  if (div) {
    const rect = div.getBoundingClientRect();
    
    // Pass the coordinates to the main process and capture the image
    const imageBuffer = await window.api.captureRect({
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    });

    // Create a Blob from the Buffer
    const imageBlob = new Blob([imageBuffer], {type: 'image/png'});
    const clipboardItems = new ClipboardItem({ 'image/png': imageBlob });

    // Write the image to the clipboard
    await navigator.clipboard.write([clipboardItems]);
  }
};

const serializeHTML = (nodes: Descendant[]): string => {
  let html = '';
  let inBlock = false;
  let blockMode: string | null = null;
  let blockText = '';
  let isLastChild = false;

  const queue: Descendant[] = [...nodes];

  const processBlock = (text: string, mode: string) => {
    if (mode === 'latex' || mode === 'double-latex') {
      return latexMathToHtml(text);
    } else if (mode === 'code') {
      return `<pre><code class="language-javascript">${Prism.highlight(text, Prism.languages.javascript, 'javascript')}</code></pre>`;
    } else {
      return text;
    }
  };

  while (queue.length > 0) {
    const parentnode = queue.shift()!;
    if ('children' in parentnode) {
      if (parentnode.type != 'paragraph'){
        queue.push(...parentnode.children);
        continue;
      }
      for (let i = 0; i < parentnode.children.length; i++) {
        const node = parentnode.children[i];
        isLastChild = i === parentnode.children.length - 1;

        if (Text.isText(node)){
          let span = node.text;

          if (inBlock) {
            let endMarker;
            if (blockMode === 'latex') {
              endMarker = /\$/;
            } else if (blockMode === 'double-latex') {
              endMarker = /\$\$/;
            } else if (blockMode === 'code') {
              endMarker = /```/;
            }
            const match = endMarker ? span.match(endMarker) : null;
            if (match) {
              const endIndex = match.index! + (blockMode === 'latex' ? 1 : blockMode === 'double-latex' ? 2 : blockMode === 'code' ? 3 : 0);
              blockText += span.slice(0, endIndex - (blockMode === 'code' ? 3 : 0));
              html += processBlock(blockText, blockMode!);
              span = span.slice(endIndex);
              inBlock = false;
              blockMode = null;
              blockText = '';
            } else {
              blockText += span;
              if (blockMode === 'code') {
                blockText += '\n';
              }
              continue;
            }
          }
      
          if (!inBlock) {
            // Check if text contains display LaTeX
            if (/\$\$(.*?)\$\$/.test(span)) {
              span = span.replace(/\$\$(.*?)\$\$/g, (match, latex) => {
                return latexMathToHtml(`$$${latex}$$`);
              });
            }

            // Check if text contains inline LaTeX
            else if (/\$(.*?)\$/.test(span)) {
              span = span.replace(/\$(.*?)\$/g, (match, latex) => {
                // If the latex content is empty, return the original match
                if (latex.trim() === '') {
                  return match;
                }

                // Otherwise, convert the latex content to HTML
                return latexMathToHtml(`$${latex}$`);
              });
            }

            // Check if text contains code block
            else if (/```([^`]*)```/gs.test(span)) {
            span = span.replace(/```([^`]*)```/g, function(match, code) {
              // The language is assumed to be JavaScript. Modify as necessary.
              return `<pre><code class="language-javascript">${Prism.highlight(code, Prism.languages.javascript, 'javascript')}</code></pre>`;
            });
          }


            let startCodeMarker = span.indexOf('```');
            let startDoubleLatexMarker = span.indexOf('$$');
            let startSingleLatexMarker = span.indexOf('$');
          
            if (startDoubleLatexMarker !== -1) {
              blockMode = 'double-latex';
            } else if (startSingleLatexMarker !== -1) {
              blockMode = 'latex';
            } else if (startCodeMarker !== -1) {
              blockMode = 'code';
            }
          
            let markerIndex = Math.min(
              startCodeMarker !== -1 ? startCodeMarker : Infinity,
              startDoubleLatexMarker !== -1 ? startDoubleLatexMarker : Infinity,
              startSingleLatexMarker !== -1 ? startSingleLatexMarker : Infinity,
            );
      
            if (markerIndex !== Infinity) {
              inBlock = true;
              blockText += span.slice(markerIndex + (blockMode === 'code' ? 3 : 0));
              if (blockMode === 'code') {
                blockText += '\n';
              }
              span = span.slice(0, markerIndex);
            } else if (isLastChild) {
              span += '<br>';
            }
          }
          
          if (node.bold) {
            span = `<strong>${span}</strong>`;
          }
          if (node.italics) {
            span = `<em>${span}</em>`;
          }
          if (node.underline) {
            span = `<u>${span}</u>`;
          }
          if (node.font) {
            span = `<span style="font-family: ${node.font}">${span}</span>`;
          }
          if (node.size) {
            span = `<span style="font-size: ${node.size}">${span}</span>`;
          }
          if (node.color) {
            span = `<span style="color: ${node.color}">${span}</span>`;
          }
          html += span;
        }
      }
    }
  }

  // Process any remaining block after all nodes have been processed
  if (inBlock) {
    html += `<span style="color: red">Unclosed ${blockMode} block</span>`;
  }

  return html;
};

const App: React.FC = () => {
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>(initialValue);

  useEffect(() => {
    ReactEditor.focus(editor);
  }, []);
  
  const renderElement = useCallback((props: RenderElementProps) => {
    return <DefaultElement {...props} />;
  }, []);  

  const markdownContainerRef = useRef<HTMLDivElement | null>(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'default');

  async function applyTheme(theme: string) {
    let themeStyles = document.querySelector<HTMLStyleElement>('#theme-stylesheet');
    let newColor = '#000000';
    if(themeStyles){
      switch (theme) {
        case 'default':
          themeStyles.innerText = await fetch('./src/themes/light.css').then(res => res.text());
          newColor = '#000000';
          break;
        case 'orange':
          themeStyles.innerText = await fetch('./src/themes/orange.css').then(res => res.text());
          newColor = '#000000';
          break;
        case 'grass':
          themeStyles.innerText = await fetch('./src/themes/grass.css').then(res => res.text());
          newColor = '#000000';
          break;
        case 'dark':
          themeStyles.innerText = await fetch('./src/themes/dark.css').then(res => res.text());
          newColor = '#ffffff';
          break;
        case 'deep-blue':
          themeStyles.innerText = await fetch('./src/themes/deepblue.css').then(res => res.text());
          newColor = '#ffffff';
          break;
        case 'dim':
          themeStyles.innerText = await fetch('./src/themes/dim.css').then(res => res.text());
          newColor = '#ffffff';
          break;
        case 'deep-purple':
          themeStyles.innerText = await fetch('./src/themes/deeppurple.css').then(res => res.text());
          newColor = '#ffffff';
          break;
        case 'wine':
          themeStyles.innerText = await fetch('./src/themes/wine.css').then(res => res.text());
          newColor = '#ffffff';
          break;
        case 'nightlife':
          themeStyles.innerText = await fetch('./src/themes/nightlife.css').then(res => res.text());
          newColor = '#ffffff';
          break;
      }
    } else {
      console.error("Cannot find element with id 'theme-stylesheet'");
    }

    // Traverse all text nodes in the Slate value
    for (const [node, path] of Editor.nodes(editor, { at: [] })) {
      // Check if the node is a text node
      if (Text.isText(node)) {
        // add a mark with the new text color to each text node
        Transforms.setNodes(editor, { color: newColor }, { at: path });
      }
    }

    localStorage.setItem('theme', theme);  // save theme to local storage
    
    // let editorElement = document.getElementById("SlateEditor");
    // void editorElement?.offsetHeight;
    // ReactEditor.focus(editor);
  }

  const [hasShownWarning, setHasShownWarning] = useState(false);

  useEffect(() => {
    window.electron.onThemeChange((event: any, theme: any) => {
      setTheme(theme);
      // if (!hasShownWarning) {
      //   const userConfirmed = window.confirm('Changing the theme may overwrite your text color. Are you sure you want to proceed?');
      //   if (userConfirmed) {
      //     setTheme(theme); // update theme state when it changes
      //     setHasShownWarning(true); // update the state to not show the warning again
      //   }
      // } else {
      //   setTheme(theme);
      // }
    });
  }, [hasShownWarning]);

  useEffect(() => {
    applyTheme(theme);  // apply theme whenever it changes
  }, [theme]);


  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { attributes, children, leaf } = props;

    if (leaf.font) {
      children = <span style={{ fontFamily: leaf.font }}>{children}</span>;
    }

    if (leaf.color) {
      children = <span style={{ color: leaf.color }}>{children}</span>;
    }

    if (leaf.glow) {
      children = <span style={{ textShadow: leaf.glow }}>{children}</span>;
    }

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.italics) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    if (leaf.size) {
      children = <span style={{ fontSize: leaf.size }}>{children}</span>;
    }

    return <span {...attributes}>{children}</span>;
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!editor.selection) return;
      // const [leaf] = Editor.leaf(editor, editor.selection);

      // Handle 'bold' keyboard shortcut
      if (event.key === 'b' && event.ctrlKey) {
        event.preventDefault();
        const marks = Editor.marks(editor);
        const isBold = marks ? marks.bold === true : false;
        Editor.addMark(editor, 'bold', !isBold);
      }

      // Handle 'underline' keyboard shortcut
      else if (event.key === 'u' && event.ctrlKey) {
        event.preventDefault();
        const marks = Editor.marks(editor);
        const isUnderline = marks ? marks.underline === true : false;
        Editor.addMark(editor, 'underline', !isUnderline);
      }

      // Handle 'code' keyboard shortcut
      else if (event.key === '`' && event.ctrlKey) {
        event.preventDefault();
        wrapCodeBlock(editor);
      }
    },
    [editor]
  );

  return (
    <div className="app-container">
      <Split 
        className="split"
        minSize={200}
        sizes = {[60, 40]}
      >
        <div className="edit-container">
          <Slate editor={editor} initialValue={value} onChange={setValue}>
            <div className = "toolbar">
              <FontFamilyDropdown/>
              <FontSizeDropdown/>
              <TextColorButton />
              <BoldButton />
              <ItalicsButton />
              <UnderlineButton />
              <InlineCodeButton />
              <UndoButton />
              <RedoButton />
              <button className="toolbarBtn" onClick={handleCaptureClick}><i className="fa-regular fa-image"></i></button>
            </div>
            <Editable
              id="SlateEditor"
              className="slate-editor"
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              onKeyDown={handleKeyDown}
            />
          </Slate>
        </div>
        <div className="preview-container">
          <div className="preview-box" ref={markdownContainerRef}>
            <h2></h2>
            <div dangerouslySetInnerHTML = {{ __html: serializeHTML(value) }} />
          </div>
        </div>
      </Split>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
