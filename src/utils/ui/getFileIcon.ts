export function getFileIcon(fileExtension: string): string {
    switch (fileExtension.toLowerCase()) {
        case 'js':
            return '<i class="fab fa-js-square"></i>';
        case 'jsx':
        case 'tsx':
            return '<i class="fab fa-react"></i>';
        case 'ts':
            return '<i class="fab fa-js-square"></i>';
        case 'css':
            return '<i class="fab fa-css3-alt"></i>';
        case 'html':
            return '<i class="fab fa-html5"></i>';
        case 'py':
            return '<i class="fab fa-python"></i>';
        case 'java':
            return '<i class="fab fa-java"></i>';
        case 'json':
            return '<i class="fas fa-database"></i>';
        case 'xml':
        case 'yml':
        case 'yaml':
            return '<i class="fas fa-code"></i>';
        case 'md':
            return '<i class="fab fa-markdown"></i>';
        case 'sh':
        case 'bash':
            return '<i class="fas fa-terminal"></i>';
        case 'php':
            return '<i class="fab fa-php"></i>';
        case 'rb':
            return '<i class="fas fa-gem"></i>';
        case 'cpp':
        case 'c':
            return '<i class="fas fa-copyright"></i>';
        case 'go':
            return '<i class="fab fa-golang"></i>';
        case 'sql':
            return '<i class="fas fa-database"></i>';
        case 'dockerfile':
        case 'docker':
            return '<i class="fab fa-docker"></i>';
        case 'svg':
            return '<i class="fas fa-vector-square"></i>';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
            return '<i class="fas fa-file-image"></i>';
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
            return '<i class="fas fa-file-video"></i>';
        case 'mp3':
        case 'wav':
        case 'flac':
        case 'ogg':
            return '<i class="fas fa-file-audio"></i>';
        case 'pdf':
            return '<i class="fas fa-file-pdf"></i>';
        case 'zip':
        case 'rar':
        case '7z':
            return '<i class="fas fa-file-archive"></i>';
        case 'txt':
            return '<i class="fas fa-file-alt"></i>';
        default:
            return '<i class="fas fa-file-alt"></i>'; // Default for unknown types
    }
}
