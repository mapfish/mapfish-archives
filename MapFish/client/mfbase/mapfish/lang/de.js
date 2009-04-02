/**
 * @requires OpenLayers/Lang/de.js
 */
OpenLayers.Util.extend(OpenLayers.Lang.de, {
    'mf.tools': 'Tools', //TODO

    'mf.layertree': 'Layer tree', //TODO
    'mf.layertree.opacity': 'Opazität',
    'mf.layertree.remove': 'Ausblenden',
    'mf.layertree.zoomToExtent': 'Zoom object zoomen', //TODO: find a better translation

    'mf.print.mapTitle': 'Titel',
    'mf.print.comment': 'Bemerkung',
    'mf.print.loadingConfig': 'Laden der Konfiguration...',
    'mf.print.serverDown': ' Der Druck-Systemdienst funktioniert nicht',
    'mf.print.unableToPrint': "Unable to print",
    'mf.print.generatingPDF': "Generierung des PDFs...",
    'mf.print.dpi': 'DPI',
    'mf.print.scale': 'Massstab',
    'mf.print.rotation': 'Rotation',
    'mf.print.print': 'Drucken',
    'mf.print.resetPos': 'Reset Pos.',
    'mf.print.layout': 'Layout',
    'mf.print.addPage': 'Seite hinzufügen',
    'mf.print.remove': 'Seite entfernen',
    'mf.print.clearAll': 'Alles löschen',
    'mf.print.pdfReady': 'Das PDF-Dokument kann heruntergeladen werden.',
    'mf.print.noPage': 'Keine Seite ausgewählt, bitte auf "' + this['mf.print.addPage'] + '"-' +
                       'Button klicken um eine Seite zu hinzufügen.',
    'mf.print.print-tooltip': 'Ein PDF Generieren, dass mindestens die bounding box umfasst',

    'mf.error': 'Fehler',
    'mf.warning': 'Warnung',
    'mf.information': 'Information',
    'mf.cancel': 'Abbrechen',

    'mf.recenter.x': 'X',
    'mf.recenter.y': 'Y',
    'mf.recenter.submit': 'zentrieren',
    'mf.recenter.missingCoords': 'Fehlende Koordinaten.',
    'mf.recenter.outOfRangeCoords': 'Eingegebene Koordinaten (${myX}, ${myY}) sind ausserhalb des Kartenperimeters<br />' +
                                    'und zollen in folgenden Auschnitt sein:<br/>' +
                                    '${coordX} zwischen ${minCoordX} und ${maxCoordX},<br />' +
                                    '${coordY} zwischen ${minCoordY} und ${maxCoordY}',
    'mf.recenter.ws.error': 'Ein Fehler ist bei Zugang zum Webdienst vorgekommen:',
    'mf.recenter.ws.service': 'Ausgewählter Webdienst',

    'mf.control.previous': 'Vorherige Ansicht',
    'mf.control.next': 'Nexte Ansicht',
    'mf.control.pan': 'Bewegen',
    'mf.control.zoomIn': 'Hinein zoomen',
    'mf.control.zoomOut': 'Heraus zoomen',
    'mf.control.zoomAll': 'Globale Ansicht'
});
