import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';


void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'txteditor',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo,
        brightness: Brightness.light),
        
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo,
        brightness: Brightness.dark),
      ),
      themeMode: ThemeMode.dark,
      // home: const MyHomePage(title: 'txtEditor'),
      home: NoteListPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class NoteListPage extends StatefulWidget {
  @override
  _NoteListPageState createState() => _NoteListPageState();
}

class _NoteListPageState extends State<NoteListPage> {
  late Future<List<File>> futureFiles;

  Future<String> get _localPath async {
    final directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  Future<Directory> get _localNotesDirectory async {
    final path = await _localPath;
    return Directory('$path/vault/');
  }

  Future<List<File>> _listFiles() async {
    final notesDirectory = await _localNotesDirectory;
    return notesDirectory.listSync().map((item) {
      return File(item.path);
    }).toList();
  }

    Future<void> _renameFile(File file) async {
    final newName = await showDialog<String>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Rename file'),
          content: const TextField(
            decoration: InputDecoration(hintText: 'Enter new name'),
            autofocus: true,
          ),
          actions: [
            TextButton(
              child: const Text('Cancel'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: const Text('Rename'),
              onPressed: () {
                Navigator.of(context).pop(); // Pop the dialog and get the entered text
              },
            ),
          ],
        );
      },
    );

    if (newName != null && newName.isNotEmpty) {
      final oldPath = file.path;
      final newPath = oldPath.replaceFirst(
        RegExp(r'[^/]*$'),
        '$newName.txt',
      );
      await file.rename(newPath);
    }

    setState(() {
      futureFiles = _listFiles(); // Update the file list
    });
  }

  Future<void> _deleteFile(File file) async {
    await file.delete();
    setState(() {
      futureFiles = _listFiles(); // Update the file list
    });
  }

  @override
  void initState() {
    super.initState();
    futureFiles = _listFiles();
  }

  @override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text('My Notes'),
    ),
    body: FutureBuilder<List<File>>(
      future: futureFiles,
      builder: (BuildContext context, AsyncSnapshot<List<File>> snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          if (snapshot.hasError) {
            return const Center(
              child: Text('An error occurred'),
            );
          } else {
            return ListView.builder(
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(snapshot.data![index].path.split('/').last),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => TextEditorPage(
                          file: snapshot.data![index],
                        ),
                      ),
                    );
                  },
                  trailing: PopupMenuButton<int>(
                    itemBuilder: (context) => [
                      const PopupMenuItem(
                        value: 1,
                        child: Text('Rename'),
                      ),
                      const PopupMenuItem(
                        value: 2,
                        child: Text('Delete'),
                      ),
                    ],
                    onSelected: (value) {
                      if (value == 1) {
                        _renameFile(snapshot.data![index]);
                      } else if (value == 2) {
                        _deleteFile(snapshot.data![index]);
                      }
                    },
                  ),
                );
              },
            );
          }
        } else {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }
      },
    ),

    floatingActionButton: FloatingActionButton(
      onPressed: () async {
        final fileSaved = await Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => TextEditorPage()),
        );
        if (fileSaved == true) {
          setState(() {
            futureFiles = _listFiles(); // Update the file list
          });
        }
      },
      tooltip: 'Create new file',
      child: const Icon(Icons.add),
    ),
  );
}

}

class TextEditorPage extends StatefulWidget {
  final File? file;

  TextEditorPage({Key? key, this.file}) : super(key: key);

  @override
  _TextEditorPageState createState() => _TextEditorPageState();
}


class _TextEditorPageState extends State<TextEditorPage> {
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.file != null) {
      _controller.text = widget.file!.readAsStringSync();
    }
  }

  Future<String> get _localPath async {
    final directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  Future<File> get _localFile async {
    final path = await _localPath;
    final fileName = '${DateTime.now().millisecondsSinceEpoch}.txt';
    return File('$path/vault/$fileName');
  }

  Future<File> writeContent() async {
    final file = await _localFile;
    // Create the file if it doesn't exist
    final parentDirectory = file.parent;
    if (!parentDirectory.existsSync()) {
      parentDirectory.createSync();
    }
    // Write the file
    return file.writeAsString(_controller.text);
  }

  Future<File> _getLocalFile(String fileName) async {
    final path = await _localPath;
    return File('$path/vault/$fileName.txt');
  }

  Future<void> _saveText() async {
    final fileName = await showDialog<String>(
      context: context,
      builder: (context) {
        var textEditingController = TextEditingController();
        return AlertDialog(
          title: const Text('Save file'),
          content: TextField(
            controller: textEditingController,
            decoration: const InputDecoration(hintText: 'Enter file name'),
            autofocus: true,
          ),
          actions: [
            TextButton(
              child: const Text('Cancel'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: const Text('Save'),
              onPressed: () {
                Navigator.of(context).pop(textEditingController.text); // Pop the dialog and get the entered text
              },
            ),
          ],
        );
      },
    );

    if (fileName != null && fileName.isNotEmpty) {
      final file = await _getLocalFile(fileName);
      await file.writeAsString(_controller.text);
      Navigator.of(context).pop(true); // Add this line
    }
  }

  

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Text Editor'),
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _saveText, // Call _saveText instead of writeContent
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: TextField(
          controller: _controller,
          maxLines: null, // make it multi-line
          keyboardType: TextInputType.multiline,
          decoration: const InputDecoration.collapsed(hintText: "Enter your text here"),
        ),
      ),
    );
  }
}