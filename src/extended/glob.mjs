export function globMatcher(pattern) {
  if (typeof pattern !== 'string' || !pattern || pattern.length > 500 || /[\u0000-\u001f\\]/.test(pattern) || pattern.startsWith('/') || pattern.split('/').includes('..')) throw new Error('Invalid glob.');
  let regex = '^';
  for (let i=0;i<pattern.length;i++) {
    const c=pattern[i];
    if (c==='*' && pattern[i+1]==='*') { i++; if(pattern[i+1]==='/'){i++;regex+='(?:.*/)?';} else regex+='.*'; }
    else if(c==='*') regex+='[^/]*'; else if(c==='?') regex+='[^/]'; else regex+=/[.()+^$|{}[\]\\]/.test(c)?'\\'+c:c;
  }
  const compiled=new RegExp(regex+'$'); return path=>compiled.test(path);
}
