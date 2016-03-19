module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build','dist'],
    rtf2usx: {
      main: {
        expand: true,
        src: 'source/**/*.rtf',
        dest: 'build/',
        ext: '.usx',
        flatten: true,
        filter: 'isFile',
        options: {
          process: function (content, srcpath) {
            var book = srcpath.substr(srcpath.lastIndexOf('/')+1,3);
            var start = '<?xml version="1.0" encoding="utf-8"?>\n<usx version="2.5">\n\t<book code="" style="id">' + book + '</book>\n\t<para style="ide">UTF-8</para>\n\t<para style="toc3">' + book + '</para>';
            var body = content.replace(/[\n\r\t]/g,'');  // remove line breaks etc
 
            body = body.replace(/^\{\\rtf.{1,500}\}\}/,''); // remove rtf preamble
            body = body.replace(/\{\\stylesheet\{.{1,3000}\}\}/,''); // remove rtf stylesheets
            body = body.replace(/\{\\*\\.{1,5000}\}\}\}$/,''); // remove rtf postamble

            body = body.replace(/\{\\rtlch\\.{1,50}\\i\\.{1,50}\\cf1 (\w*)\}/g,'<char style="add">$1</char>'); // mark supplied words

            body = body.replace(/\\rtlch\\.{1,100}\\cf1 /g,''); // remove rtf common paths
            body = body.replace(/\\rtlch\\.{1,100}\\cf1\\.{1,300}\\cf1/g,''); // remove rtf common paths

            body = body.replace(/\{\W{1,5}\<(\d{0,1})\}/g,' <note caller="+" style="x">$1'); // mark xrefs start
            body = body.replace(/\>\}/g,'</note>'); // mark xrefs end
 
            body = body.replace(/\{\s\s\\\{\}/g,' <note caller="+" style="f">'); // mark footnotes start
            body = body.replace(/\\\}\}/g,'</note>'); // mark footnotes end
 
            body = body.replace(/\{(\d{1,3}) \}/g,'\n\t<verse number="$1" style="v"/>'); // add line break at each verse
            body = body.replace(/(\d{1,3})\s\\'b6 /g,'\n\t<para></para>\n\t<verse number="$1" style="v"/>'); // mark verses with paras
 
            body = body.replace(/[\{\}]/g,''); // remove all extra { }

            body = body.replace(/Chapter\s(\d{1,3})/g,'\n\t<chapter number="$1" style="c"/>\n\t<verse number="1" style="v"/>'); // mark chapters (and first verse)
            body = body.replace(/\\fldrslt(.{1,100})\n/,'<para style="mt1">$1</para>\n'); // mark book headings

            body = body.replace(/\<\/char\>\s\<char style=\"add\"\>/g,' '); // remove consecutive adds
            body = body.replace(/\\colortbl[^\<]{1,1500}\</,'\n\t<'); // remove any non xml
  
            var end = '\n</usx>';
            return start + body + end;
          },
        },
      },
    },
    copy: {
      txt2usx: {
        expand: true,
        src: 'source/**/*.txt',
        dest: 'build/',
        ext: '.usx',
        flatten: true,
        filter: 'isFile',
        options: {
          process: function (content, srcpath) {
            var book = srcpath.substr(srcpath.lastIndexOf('/')+1,3);
            var start = '<?xml version="1.0" encoding="utf-8"?>\n<usx version="2.5">\n\t<book code="" style="id">' + book + '</book>\n\t<para style="ide">UTF-8</para>\n\t<para style="toc3">' + book + '</para>';
            var body = content.replace(/[\r\t]/g,'');  // remove CRs etc

            body = body.replace(/\<([\w\s\.\,\;\-]{1,300}?)\>/g,'<note caller="+" style="x">$1</note>'); // find xrefs
            body = body.replace(/\{(.{1,500}?)\}/g,'<note caller="+" style="f">$1</note>'); // find footnotes
            body = body.replace(/\[(.{1,100}?)\]/g,'<note caller="+" style="w">$1</note>'); // find defined word
            body = body.replace(/\(\((.{1,200}?)\)\)/g,'<note caller="+" style="m">$1</note>'); // find measures
            body = body.replace(/^([\w\s]{1,100}?)\n/,'\n\t<para style="mt2">$1</para>\n'); // first line
            body = body.replace(/\n(\w{1,100}?)\n/,'\n\t<para style="mt3">$1</para>\n'); // second line
            body = body.replace(/\n(\w{1,100}?)\n/,'\n\t<para style="mt1">$1</para>\n\t<para style="toc2">$1</para>\n'); // third line
            body = body.replace(/\n\s{0,10}CHAPTER\s{1,10}(\d{1,3})\s{1,10}\n\s{0,10}/g,'\n\n\t<chapter number="$1" style="c"/>\n\t<verse no="1" style="v"/>'); // find chapters
            body = body.replace(/(\n\d{1,3})\s¶/g,'\n\t<para/>$1'); // find paras
            body = body.replace(/\n(\d{1,3})\s/g,'\n\t<verse no="$1" style="v"/>'); // find verses
            body = body.replace(/\n([\w\s]{1,300})\n/g,''); // remove any non-xml
   
            var end = '\n</usx>';
            return start + body + end;
          },
        },
      },
      htm2usx: {
        expand: true,
        src: 'source/**/*.htm',
        dest: 'build/',
        ext: '.usx',
        flatten: true,
        filter: 'isFile',
        options: {
          process: function (content, srcpath) {
            var book = srcpath.substr(srcpath.lastIndexOf('/')+1,3);
            var start = '<?xml version="1.0" encoding="utf-8"?>\n<usx version="2.5">\n\t<book code="" style="id">' + book + '</book>\n\t<para style="ide">UTF-8</para>\n\t<para style="toc3">' + book + '</para>\n';
            var body = content.replace(/[\r\t]/g,'');  // remove CRs etc
            body = body.replace(/\n/g,' '); // replace line breaks with spaces

            body = body.replace(/\<style\>[\w\W\s]{1,200000}\<\/style\>/g,''); // remove style blocks
            //body = body.replace(/\sstyle='[\w\s\-.:;]{1,200}'/g,''); // remove inline styles
            body = body.replace(/\<\/{0,1}html\>/g,''); // remove html tags
            body = body.replace(/\<\/{0,1}head\>/g,''); // remove head tags
            body = body.replace(/\<meta\s[\w\W]{1,200}\>/g,''); // remove meta tags
            body = body.replace(/\<\/{0,1}b\>/g,''); // remove b tags
            body = body.replace(/\<body\s[\w\W]{1,200}\>/g,''); // remove body tags - start
            body = body.replace(/\<\/body\>/g,''); // remove body tags - end
            body = body.replace(/\<span\s[\w\s\-.:;'=]{1,200}?\>/g,''); // remove span tags - start
            body = body.replace(/\<\/span\>/g,''); // remove span tags - end
            body = body.replace(/\<p\s[\w\s\-.:;'=]{1,200}?\>(\d{1,3})\s/g,'\n\t<verse no="$1" style="v"/>'); // change p tags to verse - start
            body = body.replace(/\<p\s[\w\s\-.:;'=]{1,200}?\>/g,''); // remove other p tags - start
            body = body.replace(/\<\/p\>/g,''); // remove p tags - end
            body = body.replace(/�Chapter\s(\d{1,3})/g,'\n\n\t<chapter number="$1" style="c"/>\n\t<verse no="1" style="v"/>'); // mark chapters
            body = body.replace(/(\<verse no="\d{1,3}" style="v"\/>)� /g,'<para/>\n\t$1'); // mark paras

            body = body.replace(/&nbsp;/g,''); // find nb spaces
            body = body.replace(/ {2,10}/g,' '); // collapse multiple spaces to one

            //body = body.replace(/�/g,'\n\t<para/>'); // mark paras
            body = body.replace(/\[([\w\s\.�;:]{1,100})\]/g,'<note caller="+" style="w">$1</note>'); // mark word definitions
            body = body.replace(/\(\(([\w\s\.�:]{1,100})\)\)/g,'<note caller="+" style="m">$1</note>'); // mark measures
            body = body.replace(/\{([\w\s\.\<\>\/\-,]{1,100})\}/g,'<note caller="+" style="f">$1</note>'); // mark footnotes
            body = body.replace(/\&lt;([\w\s\.\-,;]{1,200})\&gt;/g,'<note caller="+" style="x">$1</note>'); // mark xrefs

            var end = '\n</usx>';
            return start + body + end;
          },
        },
      },
      htm2tbx: {
        expand: true,
        src: 'source/**/*.htm',
        dest: 'build/',
        ext: '.tbx',
        flatten: true,
        filter: 'isFile',
        options: {
          process: function (content, srcpath) {
            var book = srcpath.substr(srcpath.lastIndexOf('/')+1,3);
            var start = '<?xml version="1.0" encoding="utf-8"?>\n' +
                        '<tbx version="1.0">\n' + 
                          '\t<book id="' + book + '">\n';

            var body = content.replace(/[\r\t]/g,'');  // remove CRs etc
            body = body.replace(/\n/g,' '); // replace line breaks with spaces
            body = body.replace(/&nbsp;/g,''); // remove non-breaking spaces

            body = body.replace(/\<style\>[\w\W\s]{1,200000}?\<\/style\>/g,''); // remove style blocks
            body = body.replace(/\<\/{0,1}html\>/g,''); // remove html tag
            body = body.replace(/\<head\>[\w\W"]{0,2000}?\<\/head\>/g,''); // remove head block
            body = body.replace(/\<\/{0,1}b\>/g,''); // remove b tags
            body = body.replace(/\<\/{0,1}body[\w\W]{0,200}?\>/g,''); // remove body tag - start & end
            body = body.replace(/\<\/{0,1}div[\w\W]{0,200}?\>/g,''); // remove div tags - start & end
            body = body.replace(/\<\/{0,1}span[\w\s\-.:;'=]{0,200}?\>/g,''); // remove span tags - start & end
            body = body.replace(/Chapter\s(\d{1,3})\s{0,1}/g,'</verse>\n\t\t</chapter>\n\n\t\t<chapter id="' + book + ':$1" no="$1">\n\t\t\t<verse id="' + book + ':$1.1" no="1">'); // mark chapters
            body = body.replace(/\s{0,1}\<p\sclass=DefaultText\salign=center[\w\s\-.:;'=]{0,200}?\>([\w\s]{1,100})\<\/p\>\s{0,1}/g,'\t\t<title>$1</title>\n'); // change p centers to titles
            body = body.replace(/\<p\s[\w\s\-.:;'=]{1,200}?\>(\d{1,3})\s/g,'</verse>\n\t\t\t<verse id="' + book + ':x.$1" no="$1">'); // change p tags to verse - start
            body = body.replace(/\<p\s[\w\s\-.:;'=]{1,200}?\>/g,''); // remove other p tags - start
            body = body.replace(/\<\/p\>/g,''); // remove p tags - end
            //body = body.replace(/(\<verse no="\d{1,3}" style="v"\/>)� /g,'<para/>\n\t$1'); // mark paras

            body = body.replace(/ {2,10}/g,' '); // collapse multiple spaces to one

            body = body.replace(/\[([\w\s\-\.,;:–]{1,100}?)\]/g,'<def>$1</def>'); // mark word definitions
            body = body.replace(/\(\(([\w\s\.:]{1,100}?)\)\)/g,'<note>$1</note>'); // mark measures
            body = body.replace(/\{([\w\s\.\<\>\/\-,;]{1,200}?)\}/g,'<alt>$1</alt>'); // mark footnotes
            body = body.replace(/\&lt;([\w\s\.\-,;]{1,300}?)\&gt;/g,'<xref>$1</xref>'); // mark xrefs

            body = body.replace(/<\/verse\>\n/,''); // remove first close verse
            body = body.replace(/\n\s\t\t\<\/chapter\>\n/,''); // remove first close chapter

            var end = '</verse>' +
                      '\n\t\t</chapter>' +
                      '\n\t</book>' +
                      '\n</tbx>';
            return start + body + end;
          },
        },
      },
      htm2tbx2: {
        expand: true,
        src: 'source/**/*.htm',
        dest: 'build/',
        ext: '.tbsx',
        flatten: true,
        filter: 'isFile',
        options: {
          process: function (content, srcpath) {
            var book = srcpath.substr(srcpath.lastIndexOf('/')+1,3);
            var start = '<?xml version="1.0" encoding="utf-8"?>\n' +
                        '<tbx version="1.0">\n' + 
                          '\t<book id="' + book + '">\n';

            var body = content.replace(/[\r\t]/g,'');  // remove CRs etc
            body = body.replace(/\n/g,' '); // replace line breaks with spaces
            body = body.replace(/&nbsp;/g,''); // remove non-breaking spaces

            body = body.replace(/\<style\>[\w\W\s]{1,200000}?\<\/style\>/g,''); // remove style blocks
            body = body.replace(/\<\/{0,1}html\>/g,''); // remove html tag
            body = body.replace(/\<head\>[\w\W"]{0,2000}?\<\/head\>/g,''); // remove head block
            body = body.replace(/\<\/{0,1}b\>/g,''); // remove b tags
            body = body.replace(/\<\/{0,1}body[\w\W]{0,200}?\>/g,''); // remove body tag - start & end
            body = body.replace(/\<\/{0,1}div[\w\W]{0,200}?\>/g,''); // remove div tags - start & end
            body = body.replace(/\<\/{0,1}span[\w\s\-.:;'=]{0,200}?\>/g,''); // remove span tags - start & end
            body = body.replace(/Chapter\s(\d{1,3})\s{0,1}/g,'</verse>\n\t\t</chapter>\n\n\t\t<chapter id="' + book + ':$1" no="$1">\n\t\t\t<verse id="' + book + ':$1.1" no="1">'); // mark chapters
            body = body.replace(/\s{0,1}\<p\sclass=DefaultText\salign=center[\w\s\-.:;'=]{0,200}?\>([\w\s]{1,100})\<\/p\>\s{0,1}/g,'\t\t<title>$1</title>\n'); // change p centers to titles
            body = body.replace(/\<p\s[\w\s\-.:;'=]{1,200}?\>(\d{1,3})\s/g,'</verse>\n\t\t\t<verse id="' + book + ':x.$1" no="$1">'); // change p tags to verse - start
            body = body.replace(/\<p\s[\w\s\-.:;'=]{1,200}?\>/g,''); // remove other p tags - start
            body = body.replace(/\<\/p\>/g,''); // remove p tags - end
            //body = body.replace(/(\<verse no="\d{1,3}" style="v"\/>)� /g,'<para/>\n\t$1'); // mark paras

            body = body.replace(/ {2,10}/g,' '); // collapse multiple spaces to one

            body = body.replace(/\[([\w\s\-\.,;:–]{1,100}?)\]/g,'<def/>'); // mark word definitions
            body = body.replace(/\(\(([\w\s\.:]{1,100}?)\)\)/g,'<note/>'); // mark notes
            body = body.replace(/\{([\w\s\.\<\>\/\-,;]{1,200}?)\}/g,'<alt/>'); // mark footnotes
            body = body.replace(/\&lt;([\w\s\.\-,;]{1,300}?)\&gt;/g,'<xref/>'); // mark xrefs

            body = body.replace(/<\/verse\>\n/,''); // remove first close verse
            body = body.replace(/\n\s\t\t\<\/chapter\>\n/,''); // remove first close chapter

            //var lines = body.split('\n'); // parse to replace missing ch numbers in references
            //var chNo;
            //for(var i = 0;i < lines.length;i++){
            //    if (lines[i].match(/^\t\t\<chapter/) != null) chNo = lines[i].replace(/^\t\t\<chapter\sid="\w\w\w:\d{1,3}"\sno="(\d{1,3})"\>/,'$1'); // find ch no
            //    if (lines[i].match(/^\t\t\t\<verse\sid="\w\w\w:x\./) != null) body = body + lines[i] + '\n'; // keep SFM notation lines
            //}

            var end = '</verse>' +
                      '\n\t\t</chapter>' +
                      '\n\t</book>' +
                      '\n</tbx>';
            return start + body + end;
          },
        },
      },
    },
    concat: {
      options: {
        separator: '\n',
        footer: '\n</bk>',
        process: function (content, srcpath) {
          var book = srcpath.substr(srcpath.lastIndexOf('/')+1,3);
          var chNo = srcpath.substring(srcpath.lastIndexOf('/')+4).split('.')[0];
          var start = '  <ch no="' + chNo + '">';
          //var start = chNo === '000' ? '<bk name="' + book + '">\n  <ch no="' + chNo + '">' : '  <ch no="' + chNo + '">';
          var end = '\n  </ch>';
          var body = content.replace(/\r/g,''); // remove any carriage returns
          body = body.replace(/\n/g,' '); // remove any line feeds
          body = body.replace(/#/g,'\n#'); // insert line feeds before verse #
          body = body.replace(/ +/g,' '); // remove multiple spaces
          body = body.replace(/#(\d+)(.*)/g,'    <vs no="$1">$2</vs>'); // XMLify verses
          body = body.replace(/> /g,'>'); // remove superflous leading spaces
          body = body.replace(/ </g,'<'); // remove superflous trailing spaces
          body = body.replace(/\*(.*)\*/g,'<i>$1</i>'); // XMLify supplied text
          return start + body + end;
        }
      },
      joh: {
        options: {
          banner: '<bk name="joh">\n'
        },
        files: {
          'build/joh.xml': ['translation/**/joh000.txt','translation/**/joh001.txt','translation/**/joh002.txt','translation/**/joh003.txt','translation/**/joh011.txt']
        }
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s)
  grunt.registerTask('default', ['clean','copy']);

};