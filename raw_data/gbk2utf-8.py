#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GBK到UTF-8转换工具
给定路径，将路径下所有GBK编码的文件转换为UTF-8编码
"""

import os
import chardet
from pathlib import Path


def detect_encoding(file_path):
    """
    检测文件编码
    
    Args:
        file_path (str): 文件路径
        
    Returns:
        str: 检测到的编码格式，如果检测失败返回None
    """
    try:
        with open(file_path, 'rb') as f:
            raw_data = f.read()
            if not raw_data:  # 空文件
                return None
            result = chardet.detect(raw_data)
            return result['encoding'] if result and result['confidence'] > 0.7 else None
    except Exception as e:
        print(f"检测文件编码失败 {file_path}: {e}")
        return None


def convert_gbk_to_utf8(file_path):
    """
    将GBK编码文件转换为UTF-8编码
    
    Args:
        file_path (str): 文件路径
        
    Returns:
        bool: 转换是否成功
    """
    try:
        # 读取GBK编码文件
        with open(file_path, 'r', encoding='gbk') as f:
            content = f.read()
        
        # 写入UTF-8编码文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"成功转换: {file_path}")
        return True
        
    except Exception as e:
        print(f"转换失败 {file_path}: {e}")
        return False


def convert_path_gbk_to_utf8(folder_path, file_extensions=None):
    """
    给定路径，将路径下所有GBK编码的文件转换为UTF-8编码
    
    Args:
        path (str): 目标路径
        file_extensions (list): 要处理的文件扩展名列表，None表示处理所有文件
        
    Returns:
        dict: 包含转换统计信息的字典
    """
    if not folder_path.exists():
        print(f"路径不存在: {folder_path}")
        return {"error": "路径不存在"}
    
    # 统计信息
    stats = {
        "total_files": 0,
        "gbk_files": 0,
        "converted_files": 0,
        "failed_files": 0,
        "converted_list": [],
        "failed_list": []
    }

    files_to_process = []
    for file_path in folder_path.rglob('*'):
        if file_extensions:
            if file_path.suffix.lower() not in file_extensions:
                continue
        files_to_process.append(file_path)
    print(f"找到 {len(files_to_process)} 个文件")
    
    for file_path in files_to_process:
        stats["total_files"] += 1
        
        # 检测文件编码
        encoding = detect_encoding(file_path)
        
        if encoding is None:
            continue
            
        # 检查是否为GBK编码（包括GB2312，它是GBK的子集）
        if encoding.lower() in ['gbk', 'gb2312', 'gb18030']:
            stats["gbk_files"] += 1
            print(f"发现GBK编码文件: {file_path} (编码: {encoding})")
            
            # 转换文件
            if convert_gbk_to_utf8(file_path):
                stats["converted_files"] += 1
                stats["converted_list"].append(str(file_path))
            else:
                stats["failed_files"] += 1
                stats["failed_list"].append(str(file_path))
    
    # 输出统计结果
    print("\n=== 转换完成 ===")
    print(f"总文件数: {stats['total_files']}")
    print(f"GBK文件数: {stats['gbk_files']}")
    print(f"成功转换: {stats['converted_files']}")
    print(f"转换失败: {stats['failed_files']}")
    
    if stats["converted_list"]:
        print("\n成功转换的文件:")
        for file in stats["converted_list"]:
            print(f"  - {file}")
    
    if stats["failed_list"]:
        print("\n转换失败的文件:")
        for file in stats["failed_list"]:
            print(f"  - {file}")
    
    return stats


def main():
    """
    主函数，提供命令行接口
    """
    folder_path = Path('./monsters')
    
    # 执行转换
    convert_path_gbk_to_utf8(folder_path)


if __name__ == "__main__":
    # 如果直接运行脚本，执行命令行接口
    main()
    
    # 示例用法:
    # convert_path_gbk_to_utf8("./test_folder")  # 转换文件夹下所有文件
    # convert_path_gbk_to_utf8("./test.txt")     # 转换单个文件
    # convert_path_gbk_to_utf8("./folder", ['.txt', '.py'])  # 只转换特定扩展名的文件