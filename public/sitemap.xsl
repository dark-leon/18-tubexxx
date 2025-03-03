<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Video XML Sitemap - 18-Tube XXX</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            margin: 0;
            padding: 2rem;
          }
          a {
            color: #0051C3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
          }
          th, td {
            padding: 0.5rem;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f9fa;
            font-weight: 600;
          }
          .video-info {
            margin: 0.5rem 0;
            padding: 0.5rem;
            background-color: #f8f9fa;
            border-radius: 4px;
          }
          .thumbnail {
            max-width: 120px;
            height: auto;
            border-radius: 4px;
          }
          .header {
            margin-bottom: 2rem;
          }
          .header h1 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Video XML Sitemap</h1>
          <p>This is a sitemap for video content on 18-Tube XXX.</p>
        </div>
        <table>
          <tr>
            <th>URL</th>
            <th>Video</th>
            <th>Last Modified</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td>
                <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
              </td>
              <td>
                <div class="video-info">
                  <img class="thumbnail" src="{video:video/video:thumbnail_loc}" alt="{video:video/video:title}"/>
                  <p><strong><xsl:value-of select="video:video/video:title"/></strong></p>
                  <p><xsl:value-of select="video:video/video:description"/></p>
                  <p>Duration: <xsl:value-of select="floor(video:video/video:duration div 60)"/>:<xsl:value-of select="format-number(video:video/video:duration mod 60, '00')"/></p>
                  <p>Views: <xsl:value-of select="video:video/video:view_count"/></p>
                </div>
              </td>
              <td><xsl:value-of select="sitemap:lastmod"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 