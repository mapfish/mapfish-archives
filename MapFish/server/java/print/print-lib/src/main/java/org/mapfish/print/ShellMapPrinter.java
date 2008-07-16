package org.mapfish.print;

import com.lowagie.text.DocumentException;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.PatternLayout;
import org.apache.log4j.PropertyConfigurator;
import org.json.JSONException;
import org.json.JSONWriter;
import org.pvalsecc.misc.FileUtilities;
import org.pvalsecc.opts.GetOptions;
import org.pvalsecc.opts.InvalidOption;
import org.pvalsecc.opts.Option;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;

/**
 * A shell version of the MapPrinter. Can be used for testing or for calling
 * from other languages than Java.
 */
public class ShellMapPrinter {
    public static final Logger LOGGER = Logger.getLogger(ShellMapPrinter.class);

    @Option(desc = "Filename for the configuration (templates&CO)", mandatory = true)
    private String config = null;

    @Option(desc = "The location of the description of what has to be printed. By default, STDIN")
    private String spec = null;

    @Option(desc = "Used only if log4jConfig is not specified. 2 if you want the debug information (stacktraces are shown), 1 for infos and 0 for only warnings and errors")
    private int verbose = 1;

    @Option(desc = "The destination file. By default, STDOUT")
    private String output = null;

    @Option(desc = "Get the config for the client form. Doesn't generate a PDF")
    private boolean clientConfig = false;

    @Option(desc = "Property file for the log4j configuration")
    private String log4jConfig = null;

    private final MapPrinter printer;

    public ShellMapPrinter(String[] args) throws IOException {
        try {
            GetOptions.parse(args, this);
        } catch (InvalidOption invalidOption) {
            help(invalidOption.getMessage());
        }
        configureLogs();
        printer = new MapPrinter(new File(config));
    }

    @SuppressWarnings({"UseOfSystemOutOrSystemErr"})
    private void help(String message) {
        System.err.println(message);
        System.err.println();
        System.err.println("Usage:");
        System.err.println("  " + getClass().getName() + " " + GetOptions.getShortList(this));
        System.err.println("Params:");
        try {
            System.err.println(GetOptions.getLongList(this));
        } catch (IllegalAccessException e) {
            e.printStackTrace(System.err);
        }
        System.exit(-1);
    }

    public void run() throws IOException, JSONException, DocumentException {
        final OutputStream outFile = getOutputStream();
        if (clientConfig) {
            final OutputStreamWriter writer = new OutputStreamWriter(outFile, Charset.forName("UTF-8"));
            JSONWriter json = new JSONWriter(writer);
            json.object();
            {
                printer.printClientConfig(json);
            }
            json.endObject();

            writer.close();

        } else {
            final InputStream inFile = getInputStream();
            printer.print(FileUtilities.readWholeTextStream(inFile), outFile);
        }
    }

    private void configureLogs() {
        if (log4jConfig != null) {
            PropertyConfigurator.configure(log4jConfig);
        } else {
            final ConsoleAppender appender = new ConsoleAppender(
                    new PatternLayout("%d{HH:mm:ss.SSS} [%t] %-5p %30.30c - %m%n"),
                    "system.err");
            BasicConfigurator.configure(appender);
            final Level level;
            switch (verbose) {
                case 0:
                    level = Level.WARN;
                    break;
                case 1:
                    level = Level.INFO;
                    break;
                default:
                    level = Level.DEBUG;
                    break;
            }
            Logger.getRootLogger().setLevel(level);
        }
    }

    private OutputStream getOutputStream() throws FileNotFoundException {
        final OutputStream outFile;
        if (output != null) {
            outFile = new FileOutputStream(output);
        } else {
            //noinspection UseOfSystemOutOrSystemErr
            outFile = System.out;
        }
        return outFile;
    }

    private InputStream getInputStream() throws FileNotFoundException {
        final InputStream file;
        if (spec != null) {
            file = new FileInputStream(spec);
        } else {
            file = System.in;
        }
        return file;
    }

    public static void main(String[] args) throws IOException, JSONException, DocumentException {
        ShellMapPrinter app = new ShellMapPrinter(args);
        try {
            app.run();
        } catch (PrintException e) {
            if (LOGGER.isDebugEnabled()) {
                LOGGER.error("Cannot generate PDF", e);
            } else {
                LOGGER.error(e.toString());
            }
            System.exit(-2);
        }
    }
}
