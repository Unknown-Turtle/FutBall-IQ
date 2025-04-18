from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.core.files.storage import FileSystemStorage
from django.contrib import messages
from .models import Team, Match, Analysis, AnalysisMetric
from datetime import datetime
import json

@login_required
def dashboard(request):
    """Main dashboard showing recent matches and analyses"""
    recent_matches = Match.objects.all().order_by('-match_date')[:5]
    user_analyses = Analysis.objects.filter(analyst=request.user).order_by('-created_at')[:5]
    
    return render(request, "upload/dashboard.html", {
        "recent_matches": recent_matches,
        "user_analyses": user_analyses
    })

@login_required
def upload_match(request):
    """Handle Premier League match video upload and creation"""
    if request.method == "POST":
        video_file = request.FILES.get("video_file")
        if video_file:
            # Save video file
            fs = FileSystemStorage()
            filename = fs.save(f"match_videos/{video_file.name}", video_file)
            
            # Create match record
            try:
                match = Match.objects.create(
                    home_team_id=request.POST.get("home_team"),
                    away_team_id=request.POST.get("away_team"),
                    match_date=datetime.strptime(request.POST.get("match_date"), "%Y-%m-%d %H:%M"),
                    match_week=int(request.POST.get("match_week")),
                    home_score=request.POST.get("home_score") or None,
                    away_score=request.POST.get("away_score") or None,
                    video_file=filename
                )
                messages.success(request, "Match uploaded successfully!")
                return redirect('match_detail', match_id=match.id)
            except ValueError as e:
                messages.error(request, f"Error creating match: {str(e)}")
                fs.delete(filename)  # Clean up the uploaded file
            
    teams = Team.objects.all().order_by('name')
    return render(request, "upload/upload_match.html", {
        "teams": teams,
        "Match": Match  # Pass Match model to template for SEASON constant
    })

@login_required
def match_detail(request, match_id):
    """Display match details and analysis options"""
    match = get_object_or_404(Match, id=match_id)
    analyses = match.analyses.all().order_by('-created_at')
    
    return render(request, "upload/match_detail.html", {
        "match": match,
        "analyses": analyses
    })

@login_required
def create_analysis(request, match_id):
    """Start a new analysis for a match"""
    match = get_object_or_404(Match, id=match_id)
    
    if request.method == "POST":
        analysis = Analysis.objects.create(
            match=match,
            analyst=request.user,
            status='PENDING',
            notes=request.POST.get("notes", "")
        )
        return redirect('analysis_detail', analysis_id=analysis.id)
        
    return render(request, "upload/create_analysis.html", {"match": match})

@login_required
def analysis_detail(request, analysis_id):
    """Show analysis details and allow metric input"""
    analysis = get_object_or_404(Analysis, id=analysis_id)
    
    if request.method == "POST":
        try:
            # Handle adding new metrics
            metric_data = {
                'analysis': analysis,
                'metric_type': request.POST.get("metric_type"),
                'team_id': request.POST.get("team"),
                'value': json.loads(request.POST.get("value")),
                'timestamp': float(request.POST.get("timestamp"))
            }
            AnalysisMetric.objects.create(**metric_data)
            return JsonResponse({"status": "success"})
        except (ValueError, json.JSONDecodeError) as e:
            return JsonResponse({"status": "error", "message": str(e)})
    
    metrics = analysis.metrics.all().order_by('timestamp')
    return render(request, "upload/analysis_detail.html", {
        "analysis": analysis,
        "metrics": metrics
    })

# Keep the original image_upload view for compatibility
def image_upload(request):
    if request.method == "POST" and request.FILES.get("image_file"):
        image_file = request.FILES["image_file"]
        fs = FileSystemStorage()
        filename = fs.save(image_file.name, image_file)
        image_url = fs.url(filename)
        return render(request, "upload.html", {
            "image_url": image_url
        })
    return render(request, "upload.html")
