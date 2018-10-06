#!/usr/bin/env node

const { readFileSync, readdirSync } = require('fs')
const { chdir, argv, exit } = require('process')

const [,,filterType] = argv

chdir('/etc/pam.d')

const re = /(-?)(auth|account|password|session)\s+(required|requisite|sufficient|optional|include|\[.+\])\s+(\S+)(?:[ \t]+([^\n]+))?/

console.log('digraph pam {')

for (const conf of readdirSync('.')) {
    const data = readFileSync(conf).toString()
    let mods = [`<b>${conf}</b>\n`];
    for (const line of data.split('\n')) {
        if (line === '' || line[0] === '#')
            continue
        [, nolog, type, control, mod, opts] = line.match(re)
        if (type === filterType) {
            mods.push(`${control} ${mod}${opts ? ` ${opts}` : ''}`)
            console.error(conf, type, control, mod)
            if (control === 'include') {
                console.log(`\t"${conf}" -> "${mod}";`)
            }
        }
    }
    console.log(`\t"${conf}" [shape=box label=<<table><tr>${
        mods.map(m => `<td align="left">${m}</td>`).join('</tr><tr>')
    }</tr></table>>];`)
}

console.log('}')