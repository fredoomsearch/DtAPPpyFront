import { Component, OnInit } from '@angular/core';
import { NewsService } from './news.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [NgFor],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  newsapi: any[] = [];
  topics = ['Economy', 'Tech', 'Politics', 'Other'];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getNews().subscribe(
      (data) => {
        this.newsapi = data.newsapi;
      },
      (error) => {
        console.error('Error fetching news:', error);
      }
    );
  }

  // Method to filter articles by topic
  getArticlesByTopic(topic: string): any[] {
    return this.newsapi.filter((article) => article.topic === topic);
  }
}