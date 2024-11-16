import path from 'path'
import { identifier } from 'safe-identifier'
// 通过将所有的路径分隔符统一替换为正斜杠，可以确保代码在不同操作系统上都能正确处理和识别路径，提高了代码的跨平台兼容性。
// 在 Web 开发中，URL 和很多 Web 标准都使用正斜杠（/）作为路径分隔符。统一使用正斜杠可以使得路径字符串与这些标准更加兼容。
const styleInjectPath = path.resolve('./style-inject.js').replace(/[\\/]+/g, '/');
export default function PostCSS() {  
    return {
        name: 'postcss',
        transform(code, id) {
            if (/\.css$/.test(id)) {
                const cssVariableName = identifier('css', true);
                let output = '';
                output += `var ${cssVariableName} = ${JSON.stringify(code)};\n` + `export default ${cssVariableName};`;
                output += '\n' + `import styleInject from '${styleInjectPath}';\n` + `styleInject(${cssVariableName});`;
                console.log(output)
                return {
                    code: output,
                    map: null
                };
            }
            return null;
        }
    }
}